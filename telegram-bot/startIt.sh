#!/bin/bash

# Starts a local blockcahin and a ipfs deamon-server.
one(){
    # startOne=$SECONDS
    pwd
    echo "Out of minty"
    cd minty
    wait
    pwd
    echo "In minty directory"
    # npm start
    ./start-local-environment.sh
    wait
    # duration=$(( SECONDS - startOne ))
    # echo "One ends at: $duration"
}

# Deployment of NFT contract in local blockchain.
two(){
    sleep 6
    # startTwo=$SECONDS
    cd minty
    echo "Starts NFT deployment"
    yes | minty deploy && echo "Deployment of ChocoSpace."
    wait
    echo "NTF deployment Ended"
    echo "Starts Treasury Smart contracts deployment."
    cd .. && pwd && truffle migrate --network polygon
    wait
    # duration=$(( SECONDS - startTwo ))
    # echo "Treasury Smart contract deployment ended at $duration."
}

three(){
    sleep 60
    node bot.js
}

# one &
# two &
three
