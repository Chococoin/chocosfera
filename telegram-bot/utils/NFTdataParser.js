module.exports = function NFTdataParser (data) {
  let bigObj = data.split('BIG OBJECT')[1]
  return JSON.parse(bigObj)
}