import { ref as $ref, atom as $atom, error as $error } from 'falcor-json-graph';
import uuid from 'uuid';
import { getUserProfile, getUserProfiles, verifyCredentials, createUser } from './user-management';

/**
 * An array of falcor routes served by the user management service.
 */
export const routes = [
  /**
   * Lookup users by their unique Id (a uuid string).
   */
  {
    route: 'usersById[{keys:userIds}]["userId", firstName", "lastName", "email"]',
    get(pathSet) {
      const userIds = pathSet.userIds;
      const userProps = pathSet[2];
      
      // Get the user profile(s)
      const getUser = userIds.length === 1
        ? getUserProfile(userIds[0]).then(profile => [ profile ])
        : getUserProfiles(userIds);
      
      // Take the user profiles that are returned and reduce into an array of path values
      return getUser.reduce((pathValues, profile, idx, length) => {
        if (profile === null) {
          pathValues.push({
            path: [ 'usersById', userIds[idx] ],
            value: $error('User not found')
          });
          return pathValues;
        }
        
        const userId = profile.userId;
        userProps.forEach(prop => {
          pathValues.push({
            path: [ 'usersById', userId, prop ],
            value: profile[prop]
          });
        });
        
        return pathValues;
      }, []);
    }
  },
  
  /**
   * Get a reference to the current user.
   */
  {
    route: 'currentUser',
    get(pathSet) {
      const userId = this.getCurrentUserId();
      return [
        { 
          path: [ 'currentUser' ], 
          value: userId === null
            ? $atom()
            : $ref([ 'usersById', userId ])
        }
      ];
    }
  },
  
  /**
   * Log a user in.
   */
  {
    route: 'currentUser.login',
    call(callPath, args) {
      // Check user name and password and if correct, log them in
      const [ email, password ] = args;
      return verifyCredentials(email, password).then(userId => {
        if (userId === null) {
          return [
            { path: [ 'currentUser', 'loginErrors' ], value: $error('Username or password are incorrect') }
          ];
        }
        
        // Set the current user id to log them in, then return the reference for falcor
        return this.setCurrentUserId(userId)
          .return([ { path: [ 'currentUser' ], value: $ref([ 'usersById', userId ]) } ]);
      });
    }
  },
  
  /**
   * Log the current user out.
   */
  {
    route: 'currentUser.logout',
    call(callPath, args) {
      // Just clear any login cookies and invalidate the falcor reference
      this.clearCurrentUserId();
      return [
        { path: [ 'currentUser' ], invalidated: true }
      ];
    }
  },
  
  /**
   * Register a new user
   */
  {
    route: 'currentUser.register',
    call(callPath, args) {
      const [ firstName, lastName, email, password ] = args;
      const userId = uuid.v4();
      const newUser = {
        userId,
        firstName,
        lastName,
        email
      };
      
      // Try to create the user
      return createUser(newUser, password).then(wasCreated => {
        if (wasCreated === false) {
          return [
            { path: [ 'currentUser', 'registerErrors' ], value: $error('A user with that email address already exists.')}
          ];
        }
        
        // Save the current user id to log them in, then return the reference
        return this.setCurrentUserId(userId)
          .return([
            { path: [ 'currentUser' ], value: $ref([ 'usersById', userId ]) }
          ]);
      });
    }
  }  
];