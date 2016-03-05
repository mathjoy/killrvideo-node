import { ref as $ref, atom as $atom, error as $error } from 'falcor-json-graph';
import uuid from 'uuid';
import { getUserProfile, getUserProfiles, verifyCredentials, createUser } from './user-management';

function mapUserProfile(props, userProfile) {
  
}

/**
 * An array of falcor routes served by the users service.
 */
export const routes = [
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
  {
    route: 'currentUser',
    get(pathSet) {
      // TODO: Get current user from cookie or whatever
      throw new Error('Not implemented');
    }
  },
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
        
        // TODO: Set whatever cookie, etc. we need for auth
        return [
          { path: [ 'currentUser' ], value: $ref([ 'usersById', userId ]) }
        ];
      });
    }
  },
  {
    route: 'currentUser.logout',
    call(callPath, args) {
      // TODO: Clear auth cookie or whatever we use for auth
      return [
        { path: [ 'currentUser' ], invalidated: true }
      ];
    }
  },
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
      
      return createUser(newUser, password).then(wasCreated => {
        if (wasCreated === false) {
          return [
            { path: [ 'currentUser', 'registerErrors' ], value: $error('A user with that email address already exists.')}
          ];
        }
        
        // TODO: Set auth cookie to log them in or whatever we need
        return [
          { path: [ 'currentUser' ], value: $ref([ 'usersById', userId ]) }
        ];
      });
    }
  }  
];