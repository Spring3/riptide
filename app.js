const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const url = require('url');
const { ReadableStream } = require('memory-streams');

const correctCMD = /^\[("\S+",.)+"\S+"\]/;
const correctNoComma = /^\[("\S+".)+"\S+"\]/;
const CMDNoBrackets = /^("\S+",.)+"\S+"/;
const CMDNoBracketsAndComma = /^("\S+".)+"\S+"/;


class App {
  constructor(config) {
    this.mainScreen = null;
    this.windowConfig = config;
    this.init = this.init.bind(this);
  }

  checkCMD(item) { // eslint-disable-line
    if (correctCMD.test(item)) {
      return item;
    } else if (correctNoComma.test(item)) {
      return item.split(' ').join(', ');
    } else if (CMDNoBrackets.test(item)) {
      return `[${item}]`;
    } else if (CMDNoBracketsAndComma.test(item)) {
      return `[${item.split(' ').join(', ')}]`;
    }
    const quoted = item.split(' ').map(i => `"${i}"`).join(', ');
    return `[${quoted}]`;
  }

  checkDestination(destination) {
    return new Promise((resolve, reject) => {
      fs.access(destination, fs.constants.F_OK | fs.constants.W_OK, (error) => {
        if (error) {
          console.error(error);
          return reject(error);
        }
        return resolve();
      });
    });
  }

  createDockerfile(destination, payload) {
    return new Promise(resolve =>
      this.checkDestination(destination).then(() => {
        const fileName = 'Dockerfile';
        const order = ['ARG', 'FROM', 'LABEL', 'USER', 'SHELL', 'WORKDIR', 'ADD', 'COPY', 'RUN', 'EXPOSE', 'ENV', 'VOLUME', 'ENTRY POINT', 'ONBUILD', 'STOP SIGNAL', 'HEALTHCHECK', 'CMD'];
        const multiline = ['ARG', 'EXPOSE', 'LABEL', 'ADD', 'COPY', 'RUN', 'ENV', 'ONBUILD'];
        const dockerfile = fs.createWriteStream(path.join(destination, fileName));
        const source = new ReadableStream();
        source.append('# Generated by Riptide https://github.com/Spring3/riptide \n');
        for (const item of order) {
          if (payload[item]) {
            if (item.toUpperCase() === 'CMD') {
              payload[item] = this.checkCMD(payload[item]); // eslint-disable-line
            }
            // EXPOSE 8000
            let content = `${item} ${payload[item].trim()}`;
            if (payload[item].toUpperCase().includes(`${item} `)) {
              // if already has EXPOSE in value
              content = `${payload[item].trim()}`;
            }
            if (multiline.includes(item)) {
              content = payload[item].split('\n')
                .filter(i => i && i.trim())
                .map((i) => {
                  const command = i.trim();
                  if (command.toUpperCase().includes(`${item} `)) {
                    // ENV NODE_ENV=production
                    return `${command}`;
                  }
                  // if does not have ENV
                  return `${item} ${command.trim()}`;
                }).join('\n');
            }
            source.append(`${content}\n\n`);
          }
        }
        source.pipe(dockerfile);
        return resolve({
          fileName,
          filePath: destination
        });
      }).catch(() => resolve({}))
    );
  }

  init() {
    this.mainScreen = new BrowserWindow(this.windowConfig);
    this.mainScreen.loadURL(url.format({
      pathname: path.join(__dirname, './app/index.html'),
      protocol: 'file:',
      slashes: true
    }));

    if (process.env.NODE_ENV !== 'produciton') {
      this.mainScreen.webContents.openDevTools();
    }

    this.mainScreen.on('closed', () => {
      delete this.mainScreen;
    });

    ipcMain.on('build', (event, data) => {
      switch (data.type.toUpperCase()) {
        case 'DOCKERFILE': {
          this.createDockerfile(data.destination, data.payload).then(result => event.sender.send('build:rs', result)).catch(console.err);
          break;
        }
        default: {
          console.err('Unsupported file format');
        }
      }
    });
  }
}

const Riptide = new App({ width: 800, height: 600 });

console.log(app.getPath('userData'));
app.on('ready', Riptide.init);
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
app.on('activate', () => {
  if (Riptide.mainScreen === null) {
    Riptide.init();
  }
});
