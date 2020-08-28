import { createAction } from 'redux-actions';
import apiClient from '../api/Api';
import { addErrorToast, addSuccessToast } from './toasts';
import { addClientInfo, getParamsForClientsSearch, normalizeLogs } from '../helpers/helpers';
import { DEFAULT_LOGS_FILTER, QUERY_LOGS_PAGE_SIZE } from '../helpers/constants';

const getLogsWithParams = async (config) => {
    const { older_than, filter, ...values } = config;
    const rawLogs = await apiClient.getQueryLog({
        ...filter,
        older_than,
    });
    const { data, oldest } = rawLogs;
    let logs = normalizeLogs(data);
    const clientsParams = getParamsForClientsSearch(logs, 'client');

    if (Object.keys(clientsParams).length > 0) {
        const clients = await apiClient.findClients(clientsParams);
        logs = addClientInfo(logs, clients, 'client');
    }

    return {
        logs,
        oldest,
        older_than,
        filter,
        ...values,
    };
};

export const toggleDetailedLogs = createAction('TOGGLE_DETAILED_LOGS');
export const setRenderLimitIdx = createAction('SET_LOGS_RENDER_INDEX');

export const setInitialRenderLimitIdx = () => (dispatch) => {
    dispatch(setRenderLimitIdx(QUERY_LOGS_PAGE_SIZE));
};

export const getLogsRequest = createAction('GET_LOGS_REQUEST');
export const getLogsFailure = createAction('GET_LOGS_FAILURE');
export const getLogsSuccess = createAction('GET_LOGS_SUCCESS');

export const getLogs = () => async (dispatch, getState) => {
    dispatch(getLogsRequest());
    try {
        const { filter, oldest } = getState().queryLogs;

        const logs = await getLogsWithParams({
            older_than: oldest,
            filter,
        });

        dispatch(getLogsSuccess(logs));
    } catch (error) {
        dispatch(addErrorToast({ error }));
        dispatch(getLogsFailure(error));
    }
};

export const setLogsFilterRequest = createAction('SET_LOGS_FILTER_REQUEST');

/**
 *
 * @param filter
 * @param {string} filter.search
 * @param {string} filter.response_status 'QUERY' field of RESPONSE_FILTER object
 * @returns function
 */
export const setLogsFilter = (filter) => setLogsFilterRequest(filter);

export const setFilteredLogsRequest = createAction('SET_FILTERED_LOGS_REQUEST');
export const setFilteredLogsFailure = createAction('SET_FILTERED_LOGS_FAILURE');
export const setFilteredLogsSuccess = createAction('SET_FILTERED_LOGS_SUCCESS');

export const setFilteredLogs = (filter) => async (dispatch) => {
    dispatch(setFilteredLogsRequest());
    try {
        const logs = await getLogsWithParams({ older_than: '', filter });
        dispatch(setFilteredLogsSuccess(logs));
    } catch (error) {
        dispatch(addErrorToast({ error }));
        dispatch(setFilteredLogsFailure(error));
    }
};

export const resetFilteredLogs = () => setFilteredLogs(DEFAULT_LOGS_FILTER);

export const refreshFilteredLogs = () => async (dispatch, getState) => {
    const { filter } = getState().queryLogs;
    await dispatch(setFilteredLogs(filter));
};

export const clearLogsRequest = createAction('CLEAR_LOGS_REQUEST');
export const clearLogsFailure = createAction('CLEAR_LOGS_FAILURE');
export const clearLogsSuccess = createAction('CLEAR_LOGS_SUCCESS');

export const clearLogs = () => async (dispatch) => {
    dispatch(clearLogsRequest());
    try {
        await apiClient.clearQueryLog();
        dispatch(clearLogsSuccess());
        dispatch(addSuccessToast('query_log_cleared'));
    } catch (error) {
        dispatch(addErrorToast({ error }));
        dispatch(clearLogsFailure(error));
    }
};

export const getLogsConfigRequest = createAction('GET_LOGS_CONFIG_REQUEST');
export const getLogsConfigFailure = createAction('GET_LOGS_CONFIG_FAILURE');
export const getLogsConfigSuccess = createAction('GET_LOGS_CONFIG_SUCCESS');

export const getLogsConfig = () => async (dispatch) => {
    dispatch(getLogsConfigRequest());
    try {
        const data = await apiClient.getQueryLogInfo();
        dispatch(getLogsConfigSuccess(data));
    } catch (error) {
        dispatch(addErrorToast({ error }));
        dispatch(getLogsConfigFailure());
    }
};

export const setLogsConfigRequest = createAction('SET_LOGS_CONFIG_REQUEST');
export const setLogsConfigFailure = createAction('SET_LOGS_CONFIG_FAILURE');
export const setLogsConfigSuccess = createAction('SET_LOGS_CONFIG_SUCCESS');

export const setLogsConfig = (config) => async (dispatch) => {
    dispatch(setLogsConfigRequest());
    try {
        await apiClient.setQueryLogConfig(config);
        dispatch(addSuccessToast('config_successfully_saved'));
        dispatch(setLogsConfigSuccess(config));
    } catch (error) {
        dispatch(addErrorToast({ error }));
        dispatch(setLogsConfigFailure());
    }
};
