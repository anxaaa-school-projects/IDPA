# IDPA 

This project is part of the IDPA project developed by my team and me. The main focus is on building a heated standing table. One of the key features of the table is a sensor that measures the fuel level (pellets). The data collected by the sensor will be displayed in a mobile app, which will also send a notification when it's time to refill the fuel.

The purpose of this repository is to host the code required for this functionality.

A non-scaled sketch of the table can be seen below.

<img alt="Heating standing table sketch" height="500" width="500" src="./doc/resources/general/IDPA_Beheizbarer_Stehtisch.png">

Further details and documentation can be found in the folder `doc`.

## Getting started

### Preparations

1. Clone the repository
2. Open the root folder in your terminal
3. Make sure you're using node version `lts/jod` for this project. You can do this by using `nvm` on Mac / linux for example:

    1. Install `nvm`:
       ```bash
       curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
       ```
    2. Add to your shell config file:

       ```bash
       export NVM_DIR="$HOME/.nvm"
       [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
       ```
    3. Restart your terminal.
    4. Check if it worked:

       ```bash
       nvm --version
       ```
    5. Install node version `lts/jod`:

       ```bash
       nvm install lts/jod
       ```
    6. Use node version `lts/jod`:

       ```bash
       nvm use lts/jod
       ```
4. Run `npm install` in the root folder

### Start Mobile

1. Change into `mobile` folder using `cd apps/mobile/`
2. Run `npm start`
3. View it on `http://localhost:8081/` or install the app `Expo Go` on your phone and then scan the qr code with your phone to view the app on mobile.
