const { web3 } = require('../utils/web4u')

const Treasury = artifacts.require("Treasury")

require('chai')
  .use(require('chai-as-promised'))
  .should()

contract("Treasury", (accounts) => {
  let TreasuryInstance
  beforeEach(async () => {
    TreasuryInstance = await Treasury.deployed()
  })

  describe('First round of test', async () => {
    it("Should assert msg.sender is owner and treasuryBox", async () => {
      const owner = await TreasuryInstance.owner()
      const TreasuryBox = await TreasuryInstance.treasuryBox()

      assert.equal(owner, TreasuryBox, "Owner is Treasury Box.")
    })

    it("Should assert if smart contract is not paused", async () => {
      const isPaused = await TreasuryInstance.paused()

      assert.equal( isPaused, false, "Smart contract isn't paused." )
    })

    it("Should assert referer of owner is smart contract self", async () => {
      const owner = await TreasuryInstance.owner()
      const address = TreasuryInstance.address
      const referer = await TreasuryInstance.referer(owner)

      assert.equal( referer, address, "Smart contract is referer of Owner." )
    })

    it("Should assert if referer changes correctly", async () => {
      await TreasuryInstance.setReferer(accounts[0], accounts[1])
      await TreasuryInstance.setReferer(accounts[1], accounts[2])
      await TreasuryInstance.setReferer(accounts[2], accounts[3])
      await TreasuryInstance.setReferer(accounts[3], accounts[4])
      await TreasuryInstance.setReferer(accounts[4], accounts[5])
      await TreasuryInstance.setReferer(accounts[5], accounts[6])
      await TreasuryInstance.setReferer(accounts[6], accounts[7])
      await TreasuryInstance.setReferer(accounts[7], accounts[8])
      await TreasuryInstance.setReferer(accounts[8], accounts[9])
      await TreasuryInstance.setReferer(accounts[9], accounts[10])
      await TreasuryInstance.setReferer(accounts[10], accounts[11])
      await TreasuryInstance.setReferer(accounts[11], accounts[12])
      await TreasuryInstance.setReferer(accounts[12], accounts[13])
      await TreasuryInstance.setReferer(accounts[13], accounts[14])
      const referer = await TreasuryInstance.referer(accounts[14])

      assert.equal(accounts[13], referer, "Referer set properly")
    })

    it("Should assert if referer changes correctly 2", async () => {
      let err
      try {
        await TreasuryInstance.setReferer(accounts[9], accounts[1])
      } catch (error) {
        err = error
      }
      const referer = await TreasuryInstance.referer(accounts[1])

      assert.equal(accounts[0], referer, "Referer doesn't change as expected.")
    })

    it("Should assert if TreasuryBox changes correctly", async () => {
      await TreasuryInstance.setTreasuryBox(accounts[2])
      const treasuryBox = await TreasuryInstance.treasuryBox()

      assert.equal(accounts[2], treasuryBox, "TreasuryBox changes properly.")
    })

    //TODO: Assert if that new account is payable as well. 

    it("Should assert if TreasuryBox changes correctly 2", async () => {
      await TreasuryInstance.setTreasuryBox(accounts[0])
      const treasuryBox = await TreasuryInstance.treasuryBox()

      assert.equal(accounts[0], treasuryBox, "TreasuryBox changes properly.")
    })

    it("Should assert if Outsourcing pay TreasuryBox", async () => {
      const treasuryBox = await TreasuryInstance.treasuryBox()
      const balance_1 = await web3.eth.getBalance(treasuryBox)
      const amount = '5000000000000000000'
      await TreasuryInstance.outSourcing({ from: accounts[9], value: amount })
      const balance_2 = await web3.eth.getBalance(treasuryBox)

      assert.equal(amount,  balance_2 - balance_1, "Outsourcing pay TreasuryBox properly.")
    })

    it("Should assert if TreasuryBalance rises in outsourcing account", async () => {
      const balance_1 = await TreasuryInstance.treasuryBalanceOf(accounts[8])
      const amount = '1000000000000000000' 
      await TreasuryInstance.outSourcing({ from: accounts[8], value: amount })
      const balance_2 = await TreasuryInstance.treasuryBalanceOf(accounts[8])

      assert.equal(parseInt(balance_1), parseInt(balance_2) - parseInt(amount), "TreasuryBalance rises to outsourcing account properly.")
    })

    it("Should assert if assignment works properly", async () => {
      const treasuryBox = await TreasuryInstance.treasuryBox()
      const balance_1 = await web3.eth.getBalance(treasuryBox)
      const amount = '1000000000000000000'
      await TreasuryInstance.assignment({ from: accounts[14], value: amount })
      const balance_2 = await web3.eth.getBalance(treasuryBox)

      assert.equal((balance_2 / 1000) - (amount / 1000), balance_1 / 1000, "Assignment works properly.")
    })

    it("Should assert if assignment pays upstream in properly proportion", async () => {
      const balance_1 = await TreasuryInstance.treasuryBalanceOf(accounts[0])
      const balance_2 = await TreasuryInstance.treasuryBalanceOf(accounts[1])
      await TreasuryInstance.assignment({ from: accounts[9], value: '1000000000000000000' })
      const balance_3 = await TreasuryInstance.treasuryBalanceOf(accounts[0])
      const balance_4 = await TreasuryInstance.treasuryBalanceOf(accounts[1])

      assert.equal(balance_3 - balance_1 , balance_4 - balance_2 , "Assignment pays upstream properly.")
    })

    it("Should assert if assignment pays upstream properly", async () => {
      const balance_1 = await TreasuryInstance.treasuryBalanceOf(accounts[2])
      const amount = '5550000000000000000'
      await TreasuryInstance.assignment({ from: accounts[9], value: amount })
      const balance_2 = await TreasuryInstance.treasuryBalanceOf(accounts[2])
      const fee = web3.utils.toBN(amount / 100)

      assert.equal(balance_1, balance_2 - fee, "Assignment pays upstream properly.")
    })

    it("Should assert if pauses changes correctly", async () => {
      await TreasuryInstance.pause({ from: accounts[0] })
      const isPaused = await TreasuryInstance.paused()

      assert.equal(isPaused, true, "Owner changes properly.")
    })

    it("Should assert if pauses revert correctly", async () => {
      await TreasuryInstance.unpause({ from: accounts[0] })
      const isNotPaused = await TreasuryInstance.paused()

      assert.equal(isNotPaused, false, "Owner revert properly.")
    })

    it("Should assert if withdraw works properly", async () => {
      const amount = await TreasuryInstance.treasuryBalanceOf(accounts[9], { from: accounts[0] })
      await TreasuryInstance.withdrawFrom(amount, accounts[9], { from: accounts[0] })
      const treasuryBalance = await TreasuryInstance.treasuryBalanceOf(accounts[9], { from: accounts[0] })

      assert.equal(treasuryBalance, 0, "withdraw works properly.")
    })

    it("Should assert if withdraw works properly 2", async () => {
      const balance_1 = await TreasuryInstance.treasuryBalance()
      const amount = await TreasuryInstance.treasuryBalanceOf(accounts[1], { from: accounts[0] })
      await TreasuryInstance.withdrawFrom(amount, accounts[2], { from: accounts[0] })
      const balance_2 = await TreasuryInstance.treasuryBalance()

      assert.equal(balance_1 - amount, balance_2, "withdraw works properly 2.")
    })

    it("Should assert if owner changes correctly", async () => {
      await TreasuryInstance.transferOwnership(accounts[1])
      const owner = await TreasuryInstance.owner()

      assert.equal(accounts[1], owner, "Owner changes properly.")
    })

    it("Should assert if outSourcing exchange properly.", async () => {
      const balance_1 = await TreasuryInstance.treasuryBalanceOf(accounts[10])
      // console.log("Balance 1:")
      // console.log(web3.utils.fromWei(balance_1, 'ether'))

      const amount = web3.utils.toBN('3303000000000000000')
      // console.log("Ether", web3.utils.fromWei(amount, 'ether'))
      // console.log(web3.utils.fromWei(amount, 'wei'))

      const tx = await TreasuryInstance.outSourcing({ from: accounts[10], value: amount })
      const treasuryCoinPrice = await TreasuryInstance.treasuryCoinPrice()
      // console.log(web3.utils.fromWei(treasuryCoinPrice, 'ether'))
      
      // console.log("TOTAL EXCHANGED")
      let totalExchanged = treasuryCoinPrice.mul(amount).div(web3.utils.toBN(10).pow(web3.utils.toBN(18)))
      // totalExchanged = totalExchanged
      // console.log(web3.utils.fromWei(totalExchanged, 'wei'))

      const balance_2 = await TreasuryInstance.treasuryBalanceOf(accounts[10])
      // console.log("Balance 2:")
      // console.log(web3.utils.fromWei(balance_2))

      assert.equal(web3.utils.fromWei(balance_2.sub(balance_1), 'wei'), web3.utils.fromWei(totalExchanged, 'wei'), "Owner changes properly.")
    })

    it("Should assert if outSourcing charge properly.", async () => {
      const balance_1 = await web3.eth.getBalance(accounts[10])
      const amount = web3.utils.toBN('10000000000000000000')
      // const gasEstimated = await TreasuryInstance.outSourcing.estimateGas({ from: accounts[10], value: amount })
      const tx = await TreasuryInstance.outSourcing({ from: accounts[10], value: amount })
      
      const gasPrice = new web3.utils.BN(tx.receipt.effectiveGasPrice)
      const gasUsed = new web3.utils.BN(tx.receipt.gasUsed)
      const totalExpense = balance_1.sub(gasPrice.mul(gasUsed).add(amount))


      assert.equal(balance_1, totalExpense.split("<sub>")[1].split("</sub>")[0], "Owner changes properly.")
    })
  })
})