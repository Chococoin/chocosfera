# Telegram Bot Experiment

tBotExperiment pretends to be an open source of true.

What the shell is that!? 🐢

Firstly, it pretends to be a nice experiment. No matter if you are a hacker already or just a rookie nerd learning how to crack the system from the command line.
Secondly, here the code is important but isn't the most important. The most important thing is create a little community of blockchain wizzards to test some importat concepts as "Value" and "cryptoeconomics".

The master branch will conteing every thing you need to start your own Bot in Telegram. Is agnostic (has not religion and doesn't care about your color skin).

The main goal of our bot will be register each user with a salted sha-1 log-token in a mysql db. We will use a ORM so in future you might attach your bot to a variety of DB as sql, postgre, MariaDB, etc.

After completion of this task we are to going conect the bot with Stripe to recieve payments and with a smartContract in rospten to using free test ethereums.

# Create your own token with a standard ERC-20 SmartContract. 

At this poin you are invited to fork and clone this repository to create yor own super roBOT in telegram. Run your code in local and make your friends enjoy the automatic services of your super powerful and galant bot.

The sky is the limit.

# Installation and Deploy

At the moment you just can run a test purpose bot version in Telegram. To achieve that you'll need to follow Telegram's instructions for creating your own version of bot with Telegram's api bot_father. 

When done you will have a telegram api key. That must be used in a .gitignored file called telegramApiKey. 

Another API key will be needed to use another API functionalities.

To receive payments with Stripe create a .stripeApiKey file.
To register geo-localitation of user we'll use what3words. Create .what3WordsApiKey file.
To show cash liquidity with total transparece we'll use the kraken.com API. Create .krakenApiKey file.

For smartContract imprementations use a 12 words mnemonic password in .secret file.
Infura's API key is used inside .infuraApiKey file. 

