const request = require('request-promise')
const Joi = require('joi')

const channelsApiPath = "http://api.slackarchive.io/v1/channels"
const messagesApiPath = "http://api.slackarchive.io/v1/messages"
const teamsApiPath = "http://api.slackarchive.io/v1/team"

const urlMatchRegex = /((www\.)?youtube\.com\/watch\?v=.{11}|(www\.)?youtu\.be\/.{11})/i

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
        let channelIds = new Array
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

let parseMessages = (messages) => {
  let videoUrls = new Array

  messages.messages.forEach((message) => {
    const match = message.text.match(urlMatchRegex)

    if (match === null) {
      return
    } else {
      videoUrls.push(match[0])
    }
  })

  return videoUrls
}

let getMessagesForChannel = (channelId, timestamp) => {
  const options = {
    method: "GET",
    uri: messagesApiPath,
    qs: {channel: channelId, to: timestamp},
    json: true
  }

  return new Promise((fulfill, reject) => {
    request(options)
      .then((response) => {
        fulfill(response)
      })
      .catch((err) => {
        reject(err)
      })
  })
}

let getMessages = (channelIds) => {
  channelIds.forEach((channelId) => {
    getMessagesForChannel(channelId)
      .then((messages) => {
        console.log(parseMessages(messages))
      })
  })
}

module.exports = (config, videoModel) => {
  validateConfig(config)

  getTeamId(config)
    .then((teamId) => {
      return getChannels(teamId, config)
    })
    .then((channelIds) => {
      console.log(channelIds)
      getMessages(channelIds)
    })
}
