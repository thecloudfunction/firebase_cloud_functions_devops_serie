// import * as functions from 'firebase-functions'

import { report } from '../logs/index';
import { includes, isNil, merge } from 'lodash';
// import { IncomingWebhook }  from '@slack/client'

// const environment = functions.config()
// const webhook = new IncomingWebhook(environment.slack.deploymentWebhook)

/**
 * logs for error
 */
export const logErrors = (event: any, context: any = {}) => report(`errors`)(event, context)
/**
 * custom log for purchase
 */
export const logPurchase =  (payload: any): Promise<any> => report(`purchase`)(`new purchase ${payload._id}`, payload)

/**
 * Assemble a generic slack message
 */
type Colors = `green` | `red` | `yellow`
export const createSlackessage = (config: { title: string, color: Colors, fields: Array<any>, url?: string, footer?: string, footer_icon?: string }) => {
  const defaults = { url: null, footer: null, footer_icon: null }
  return merge(defaults, config)
}

/**
 * Formats a slack message for GCS build
 */
export const createSlackMessageBuildMessage = (event: any) => {
  const DEFAULT = `blue`
  const STATUS_COLOR: any = { QUEUED: DEFAULT, WORKING: DEFAULT, SUCCESS: `green`, FAILURE: `red`, TIMEOUT: `yellow`, INTERNAL_ERROR: `red` }
  return createSlackessage ({
    title: 'GCP Build 👻',
    color: STATUS_COLOR[event.status] || DEFAULT,
    fields: [{
      title: 'Status',
      value: event.status
    }],
    footer: 'Google Cloud Build',
    footer_icon: 'https://ssl.gstatic.com/pantheon/images/containerregistry/container_registry_color.png',
  })
}

/**
 * Assemble cloud build notification
 */
export const sendBuildNotification = async (message: any) => {
  try {
    const build = isNil(message.data) ? JSON.parse(new Buffer(message.data, 'base64').toString()) : null // parse the stream message

    const status = ['SUCCESS', 'FAILURE', 'INTERNAL_ERROR', 'TIMEOUT']
    if (!includes(status, build.status)) return Promise.resolve({}) // ignore status that we dont care

    const slackMessage = createSlackMessageBuildMessage(build) // format the slack message payload
    // @ts-ignore
    await webhook.send(slackMessage) // send the message 
    return Promise.resolve({ ok: true })
  } catch(error) {
    return Promise.reject({ error: error.message })
  }
}

/**
 * Slack notification for Backups
 */
export const backupSlackNotification = (status: string, type: string = `Saved`) => createSlackessage({
  title: `Firestore Backup ${type}🚔`,
  color: status === `completed` ? `green` : `red`,
  fields: [{
    title: `Backups`,
    value: `completed`
  }],
  footer: 'Google Cloud Build',
  footer_icon: 'https://ssl.gstatic.com/pantheon/images/containerregistry/container_registry_color.png',  
})