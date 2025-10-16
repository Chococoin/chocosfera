async function createLink(ctx, origin){
  let Name = false
  if (origin === 'direct') {
    Name = ctx.update.message.from.username + "-" + ctx.update.message.from.id
  } else {
    Name = ctx.update.chat_join_request.from.username + "-" + ctx.update.chat_join_request.from.id
  }
  if (Name) {
    let link
    try {
      link = await ctx.createChatInviteLink({ expire_date: 1800000000, creates_join_request: true, name : Name })
      console.log("THIS IS A LINK", link)
      return link
    } catch(e) {
      console.log("ERROR: ", e.description)
      ctx.reply("The bot can't generate links invitations out of a group.")
      return 'broken_link'
    }
  }
}

module.exports = createLink