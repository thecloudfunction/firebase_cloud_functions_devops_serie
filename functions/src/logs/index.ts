const { Logging } = require('@google-cloud/logging')

const logging = new Logging()

type Severity = `debug` | `critical` | `emergency` | `alert` | `error` | `warning` | `write`

/**
 * @param eventInfo Information about the envent
 * @param context Object based params with information about the event
 * @param severity Use to identify the type of log, implements Severity
 * @param delegate User email in charge of the event
 */
export const report = (logName: string = `errors`) => (eventInfo: any, context = {}, severity: Severity = `error`, delegate: string | null = null) => {
  const log = logging.log(logName)

  // This is common to all projects
  const metadata = {
    resource: {
      type: 'cloud_function', // This will place the logs into the cloud function filter
      labels: {
        function_name: process.env.FUNCTION_NAME,
        project: process.env.GCLOUD_PROJECT,
        region: process.env.FUNCTION_REGION
      },
    },
  }

  const event = {
    message: eventInfo.message ? eventInfo.message : eventInfo, // If the event if an Error, this is a good place to use eventInfo.message
    context: Object.assign({}, context, {
      stack: eventInfo.stack ? eventInfo.stack : null,
    }),
    delegate
  }

  return new Promise((resolve, reject) => {
    log[severity](log.entry(metadata, event), (error: any) => {
      if (error) {
       reject(error)
      }
      resolve()
    })
  })
}