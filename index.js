const request = require('request-promise')
const Joi = require('joi')

const teamsApiPath = "http://api.slackarchive.io/v1/team"

let validateConfig = (config) => {
  const schema = Joi.object().keys({
    teamName: Joi.string().required(),
    channels: Joi.array().items(Joi.string().regex(/#.+/)).required()
  })

  const result = Joi.validate(config, schema)

  if (result.error === null)
    return

  throw result.error
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
