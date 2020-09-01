import { handleActions } from 'redux-actions';
import { nanoid } from 'nanoid';

import {
    addErrorToast, addNoticeToast, addSuccessToast,
} from '../actions/toasts';
import { removeToast } from '../actions';
import { TOAST_TYPES } from '../helpers/constants';
import { wrapInObject } from '../helpers/helpers';

const toasts = handleActions({
    [addErrorToast]: (state, { payload: { error } }) => {
        const message = wrapInObject(error.toString(), 'key');
        console.error(error);

        const errorToast = {
            id: nanoid(),
            message,
            type: TOAST_TYPES.ERROR,
        };

        const newState = { ...state, notices: [...state.notices, errorToast] };
        return newState;
    },
    [addSuccessToast]: (state, { payload }) => {
        const message = payload !== null && typeof payload === 'object' ? payload : wrapInObject(payload, 'key');

        const successToast = {
            id: nanoid(),
            message,
            type: TOAST_TYPES.SUCCESS,
        };

        const newState = { ...state, notices: [...state.notices, successToast] };
        return newState;
    },
    [addNoticeToast]: (state, { payload }) => {
        const message = wrapInObject(payload.error.toString(), 'key');

        const noticeToast = {
            id: nanoid(),
            message,
            type: TOAST_TYPES.NOTICE,
        };

        const newState = { ...state, notices: [...state.notices, noticeToast] };
        return newState;
    },
    [removeToast]: (state, { payload }) => {
        const filtered = state.notices.filter((notice) => notice.id !== payload);
        const newState = { ...state, notices: filtered };
        return newState;
    },
}, { notices: [] });

export default toasts;
