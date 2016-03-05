import Router from 'falcor-router';
import Promise from 'bluebird';

import { routes } from './routes';

// The router class that handles falcor requests
export class KillrVideoRouter extends Router.createClass(routes) {
  constructor(req) {
    super();
    
    // Save request object for access inside routes
    this.req = req;
  }
  
  /**
   * Gets the currently logged in user's id.
   * 
   * @returns {string} The currently logged in user's id or null if no user is logged in.
   */
  getCurrentUserId() {
    // Passport should set the user on the request
    return this.req.user
      ? this.req.user
      : null;
  }
  
  /**
   * Sets the currently logged in user to the id provided.
   * 
   * @param {string} The user id for the user that's logged in.
   * @returns {Promise} A promise that resolves once the userId has been successfully set.
   */
  setCurrentUserId(userId) {
    return Promise.fromCallback(cb => {
      this.req.login(userId, cb);
    });
  }
  
  /**
   * Clears the currently logged in user.
   */
  clearCurrentUserId() {
    this.req.logout();
  }
};

export default KillrVideoRouter;