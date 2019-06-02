import * as admin from 'firebase-admin'
import * as functions from 'firebase-functions';
import { logPurchase, logErrors, sendBuildNotification } from './helpers/index';
import { EventContext } from 'firebase-functions/lib/cloud-functions';
import { DocumentSnapshot } from 'firebase-functions/lib/providers/firestore';

admin.initializeApp()

/**
 * Notifies slack when a build process is completed
 */
export const sendSlackMessage = functions.pubsub
    .topic(`cloud-builds`)
    .onPublish(sendBuildNotification)

/**
 * Example of catching errors
 */
export const someFunctionWithError = functions.https.onRequest(async (request, response) => {
  try {
    throw new Error(`I'm an sad error`)
    response.status(200).send({
      message: `I'm useless 😔`
    })
  } catch (error) {
    await logErrors(error)
    response.status(500).send({
      message: `Something went wrong, our developers were informed.`
    })
  }
});

/**
 * Example of a background function with custom loggings
 */
const purchaseRef = functions.firestore.document(`purchases/{doc}`)
export const processOrder = purchaseRef.onCreate(async (snap: DocumentSnapshot, context: EventContext) => {
  const order = snap.data()
  try {
    // ... any business logic
    const payload = {
      _id: order && order._id,
      items: [`Chocolate ice cream`]
    }
    /**
     * be aware this is going to make the operation slower,
     * on this case if ok cause it is a background function
     * but if this would be a callable function for example,
     * this will make the operation more lengthy
     */
    return logPurchase(payload) 
  } catch (err) {
    return logErrors(err, { order })
  }
});
 