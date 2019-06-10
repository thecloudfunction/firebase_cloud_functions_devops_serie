import * as dateformat from 'dateformat'
import { auth } from 'google-auth-library'

export const generateBackup = async () => {
  const client = await auth.getClient({
    scopes: [
      'https://www.googleapis.com/auth/datastore',
      'https://www.googleapis.com/auth/cloud-platform'
    ]
  })
  const timestamp = dateformat(Date.now(), 'yyyy-mm-dd')
  const path = `${timestamp}`
  const BUCKET_NAME = `devops101-backup`

  const projectId = await auth.getProjectId()
  const url = `https://firestore.googleapis.com/v1beta1/projects/${projectId}/databases/(default):exportDocuments`
  const backup_route = `gs://${BUCKET_NAME}/${path}`
  return client.request({
    url,
    method: 'POST',
    data: {
        outputUriPrefix: backup_route
    }
  }).then(res => {
    console.log(`Backup saved on folder on ${backup_route}`)
  })
  .catch(e => {
    console.log(e.message)
  })
}
