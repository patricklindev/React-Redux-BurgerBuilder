import * as actionTypes from './actionTypes';
import axios from '../../axios-orders';

export const authStart = () => {
    return {
        type: actionTypes.AUTH_START
    };
};

export const authSuccess = (token, userId) => {
    return {
        type: actionTypes.AUTH_SUCCESS,
        idToken: token,
        userId
    }
}

export const authFail = (error) => {
    return {
        type: actionTypes.AUTH_FAIL,
        error: error
    }
}

export const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('expirationDate');
    localStorage.removeItem('userId');
    return {
        type: actionTypes.AUTH_LOGOUT
    }
}

export const checkAuthTimeout = (expirationTime) => {
    return dispatch => {
        setTimeout(() => {
            dispatch(logout());
        }, expirationTime * 1000);
    }
}


export const auth = (email, password, isSignup) => {
    return dispatch => {
        dispatch(authStart());
        const authData = {
            email,
            password,
            returnSecureToken: true
        }

        let url = 'https://www.googleapis.com/identitytoolkit/v3/relyingparty/signupNewUser?key=AIzaSyB0YNzesAZAHVl3e-ZcIuLdPLJFqiYGnoM';

        if (!isSignup) {
            url = 'https://www.googleapis.com/identitytoolkit/v3/relyingparty/verifyPassword?key=AIzaSyB0YNzesAZAHVl3e-ZcIuLdPLJFqiYGnoM';

        }
        axios.post(url, authData)
            .then(response => {

                const expirationDate = new Date(new Date().getTime() + response.data.expiresIn * 1000);
                localStorage.setItem("expirationDate", expirationDate);
                localStorage.setItem("token", response.data.idToken);
                localStorage.setItem('userId',response.data.localId);
                dispatch(checkAuthTimeout(response.data.expiresIn));
                dispatch(authSuccess(response.data.idToken, response.data.localId));
            })
            .catch(error => {
                console.log(error);
                dispatch(authFail(error.response.data.error));
            });
    }
}

export const authCheckState = () => {
    return dispatch => {
        const token = localStorage.getItem('token');
        if (!token) {
            dispatch(logout());
        } else {
            const expirationDate = new Date(localStorage.getItem('expirationDate'));
            if (expirationDate > new Date()) {
                const userId = localStorage.getItem('userId');
                dispatch(authSuccess(token,userId));
                dispatch(checkAuthTimeout((expirationDate.getTime()-new Date().getTime())/1000));
            }else{
                dispatch(logout())
            }

        }

    }
}