import inquirer from "inquirer";
import chalk from "chalk";
import fs from "node:fs";

operation();

function operation() {
  const inquireOptions = [
    {
      type: "list",
      name: "action",
      message: "O que você deseja fazer?",
      choices: [
        "Criar conta",
        "Consultar saldo",
        "Depositar",
        "Sacar",
        "Sair\n",
      ],
    },
  ];
  handleInquirer(inquireOptions, determinateService);
}

function determinateService(res) {
  const action = res.action;

  action === "Criar conta" && createAccount();
  action === "Consultar saldo" && balanceInquire();
  action === "Depositar" && cashDeposit();
  action === "Sacar" && withdrawMoney();
  action === "Sair\n" && exit();
}

function createAccount() {
  console.log(
    chalk.bgGreen.black("\n\nParabéns por escolher o nosso banco!\n")
  );
  console.log(chalk.green("Defina as opções de sua conta a seguir:\n\n"));
  buildAccount();
}

function buildAccount() {
  const inquireOptions = [
    {
      name: "accountName",
      message: "Digite um nome para sua conta: ",
    },
  ];

  function buildAction(res) {
    const accountName = res.accountName;
    const accountNameFormated = `accounts/${accountName}.json`;
    const newAccountBalance = {
      balance: 0,
    };

    !fs.existsSync("accounts") && fs.mkdirSync("accounts");

    if (fs.existsSync(accountNameFormated)) {
      console.log(chalk.bgRed.black("\nUsuário já existe!\n"));
      buildAccount();
      return;
    }

    modifyUserAccountInfos(accountNameFormated, newAccountBalance);
    console.log(chalk.green("\nSua conta foi criada com sucesso.\n"));
    operation();
  }

  handleInquirer(inquireOptions, buildAction);
}

function balanceInquire() {
  const inquireOptions = [
    {
      name: "accountName",
      message: "Digite um nome de conta para consultar saldo: ",
    },
  ];

  function balanceAction(res) {
    const accountNameFormated = `accounts/${res.accountName}.json`;

    userNotExists(accountNameFormated);

    if (fs.existsSync(accountNameFormated)) {
      fundsMoviment(accountNameFormated, 0, "Consult");
    }
    operation();
  }
  handleInquirer(inquireOptions, depositAction());
}

function cashDeposit() {
  const inquireOptions = [
    {
      name: "accountName",
      message: "Digite um nome de conta para efetuar deposito: ",
    },
    {
      name: "montantOfDeposit",
      message: "Qual a quantidade que você deseja depositar? ",
    },
  ];

  function depositAction(res) {
    const accountName = res.accountName;
    const accountNameFormated = `accounts/${accountName}.json`;

    userNotExists(accountNameFormated);

    fs.existsSync(accountNameFormated) &&
      fundsMoviment(accountNameFormated, res.montantOfDeposit, "Deposit");

    operation();
  }

  handleInquirer(inquireOptions, depositAction);
}

function withdrawMoney() {
  const inquireOptions = [
    {
      name: "accountName",
      message: "Digite um nome de conta para efetuar saque: ",
    },
    {
      name: "montantOfWithdraw",
      message: "Qual a quantidade que você deseja sacar? ",
    },
  ];

  function WithdrawAction(res) {
    const accountNameFormated = `accounts/${res.accountName}.json`;
    userNotExists(accountNameFormated);

    fs.existsSync(accountNameFormated) &&
      fundsMoviment(accountNameFormated, res.montantOfWithdraw, "Withdraw");

    operation();
  }

  handleInquirer(inquireOptions, WithdrawAction);
}

function handleInquirer(options, callback) {
  inquirer.prompt(options).then(callback).catch(handleError);
}

function handleError(error) {
  console.log(error);
}

function userNotExists(accountName) {
  if (!fs.existsSync(accountName)) {
    console.log(chalk.bgRed.black("\n Usuário não existe! \n"));
    console.log(
      chalk.bgCyanBright.black(
        " Por favor selecione o serviço e forneça um usuário válido. \n"
      )
    );
  }
}

function modifyUserAccountInfos(path, userInfos) {
  fs.writeFileSync(path, JSON.stringify(userInfos, null, 2), handleError);
}

function fundsMoviment(accountNameFormated, value, typeOfMovimentation) {
  const account = fs.readFileSync(accountNameFormated);
  let accountToJSON = JSON.parse(account);
  const balance = accountToJSON.balance;

  if (typeOfMovimentation === "Consult") {
    console.log(
      chalk.bgBlueBright.black(
        `\n Seu saldo é de R$${accountToJSON.balance} \n`
      )
    );
    return;
  }

  if (typeOfMovimentation === "Deposit") {
    accountToJSON.balance = parseInt(accountToJSON.balance) + parseInt(value);
  }

  if (typeOfMovimentation === "Withdraw") {
    value < balance
      ? (accountToJSON.balance =
          parseInt(accountToJSON.balance) - parseInt(value))
      : console.log(chalk.bgRed.black("Saldo Insuficiente"));
  }

  modifyUserAccountInfos(accountNameFormated, accountToJSON);

  console.log(
    chalk.bgBlueBright.black(`\nSeu saldo é de R$${accountToJSON.balance}.\n`)
  );
}

function exit() {
  console.clear();
  console.log(
    chalk.bgGreen.black("\nObrigado por utilizar nossos serviços.\n")
  );
}
