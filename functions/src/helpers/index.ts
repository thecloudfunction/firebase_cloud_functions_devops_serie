import { report } from '../logs/index';

export const reportErrors = (event: any, context: any = {}) => {
  return report(`errors`)(event, context)
}

/**
 * custom log for purchase
 */
export const logPurchase =  (payload: any): Promise<any> => report(`purchase`)(`new purchase ${payload._id}`, payload)