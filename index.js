module.exports = (robot) => {
  console.log('oni bot started')

  // New user welcoming
  robot.on('issues.opened', async context => {
    const response = await context.github.issues.getForRepo(context.repo({
      state: 'all',
      creator: context.payload.issue.user.login
    }))

    const config = await context.config('config.yml')
    const user = context.payload.issue.user
    console.dir(config.backers)
    const isBacker = (userId) => { return !!(config.backers && config.backers.indexOf(userId) >= 0)}

    console.log("User: " + context.payload.issue.user)
      console.dir(context.payload.issue.user)

    const countIssue = response.data.filter(data => !data.pull_request)
    if (countIssue.length === 1) {
      try {
        if (config.newIssueWelcomeComment) {
          context.github.issues.createComment(context.issue({body: config.newIssueWelcomeComment}))
        }
      } catch (err) {
        if (err.code !== 404) {
          throw err
        }
      }
    } 

      try {
          const { owner, repo } = context.repo()
          const number = context.payload.issue.number

          if (isBacker(parseInt(user.id, 10))) {
              context.github.issues.addLabels({ owner, repo, number, labels: ["backer"]})
          } else {
            if (config.nonBackerComment) {
              context.github.issues.createComment(context.issue({body: config.nonBackerComment}))
            }
          }
      } catch(err) {
        if (err.code !== 404) {
            throw err;
        }
      }
  })
}
