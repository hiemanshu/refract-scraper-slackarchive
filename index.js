const request = require('request-promise')

const teamsApiPath = "http://api.slackarchive.io/v1/team"

let validateConfig = (config) => {
  if (config == undefined) {
    throw "Undefined Config"
  }
  if (!("teamName" in config)) {
    throw "Team Name not defined in config"
  }
  if (!("channels" in config)) {
    throw "Channels not defined in config"
  }
}

let getTeamId = (config) => {
  const options = {
    method: "GET",
    uri: teamsApiPath
  }

  return new Promise((fulfill, reject) => {
    request(options)
      .then((response) => {
        let parsedResponse = JSON.parse(response)
        parsedResponse.team.forEach((item) => {
          if (item.name === config.teamName) {
            fulfill(item.team_id)
          }
        })
      })
      .catch((err) => {
        reject(err)
      })
  })
}

module.exports = (config, videoModel) => {
  validateConfig(config)

  getTeamId(config)
    .then((teamId) => {
      console.log(teamId)
    })
}
