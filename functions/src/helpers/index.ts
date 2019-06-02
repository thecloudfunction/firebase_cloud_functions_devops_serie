import { report } from '../logs/index';

/**
 * logs for error
 */
export const logErrors = (event: any, context: any = {}) => report(`errors`)(event, context)
/**
 * custom log for purchase
 */
export const logPurchase =  (payload: any): Promise<any> => report(`purchase`)(`new purchase ${payload._id}`, payload)