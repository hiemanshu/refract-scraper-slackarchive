const request = require('request-promise')
const Joi = require('joi')

const teamsApiPath = "http://api.slackarchive.io/v1/team"
const channelsApiPath = "http://api.slackarchive.io/v1/channels"

let validateConfig = (config) => {
  const schema = Joi.object().keys({
    teamName: Joi.string().required(),
    channels: Joi.array().required()
  })

  const result = Joi.validate(config, schema)

  if (result.error === null)
    return

  throw result.error
}

let getTeamId = (config) => {
  const options = {
    method: "GET",
    uri: teamsApiPath,
    json: true
  }

  return new Promise((fulfill, reject) => {
    request(options)
      .then((response) => {
        response.team.forEach((item) => {
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

let getChannels = (teamId, config) => {
  const options = {
    method: "GET",
    uri: channelsApiPath,
    qs: {team_id: teamId},
    json: true
  }

  return new Promise((fulfill, reject) => {
    request(options)
      .then((response) => {
        let channelIds = new Array()
        response.channels.forEach((channel) => {
          if (config.channels.includes(channel.name)) {
            channelIds.push(channel.channel_id)
          }
        })
        fulfill(channelIds)
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
      getChannels(teamId, config)
        .then((channelIds) => {
          console.log(channelIds)
        })
    })
}
