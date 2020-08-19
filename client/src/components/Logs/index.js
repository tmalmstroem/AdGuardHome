import React, { Fragment, useEffect, useState } from 'react';
import { Trans } from 'react-i18next';
import Modal from 'react-modal';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import queryString from 'query-string';
import classNames from 'classnames';
import propTypes from 'prop-types';
import {
    BLOCK_ACTIONS,
    SMALL_SCREEN_SIZE,
} from '../../helpers/constants';
import Loading from '../ui/Loading';
import Filters from './Filters';
import Disabled from './Disabled';
import { getFilteringStatus } from '../../actions/filtering';
import { getClients } from '../../actions';
import { getDnsConfig } from '../../actions/dnsConfig';
import {
    getLogsConfig,
    refreshFilteredLogs,
    resetFilteredLogs,
    setFilteredLogs,
    toggleDetailedLogs,
} from '../../actions/queryLogs';
import { addSuccessToast } from '../../actions/toasts';
import InfiniteTable from './InfiniteTable';
import Row from './Cells';
import './Logs.css';

const processContent = (data, buttonType) => Object.entries(data)
    .map(([key, value]) => {
        if (!value) {
            return null;
        }

        const isTitle = value === 'title';
        const isButton = key === buttonType;
        const isBoolean = typeof value === 'boolean';
        const isHidden = isBoolean && value === false;

        let keyClass = 'key-colon';

        if (isTitle) {
            keyClass = 'title--border';
        }
        if (isButton || isBoolean) {
            keyClass = '';
        }

        return isHidden ? null : <Fragment key={key}>
            <div
                className={classNames(`key__${key}`, keyClass, {
                    'font-weight-bold': isBoolean && value === true,
                })}>
                <Trans>{isButton ? value : key}</Trans>
            </div>
            <div className={`value__${key} text-pre text-truncate`}>
                <Trans>{(isTitle || isButton || isBoolean) ? '' : value || '—'}</Trans>
            </div>
        </Fragment>;
    });

const Logs = () => {
    const dispatch = useDispatch();
    const history = useHistory();

    const {
        response_status: response_status_url_param = '',
        search: search_url_param = '',
    } = queryString.parse(history.location.search);

    const {
        enabled,
        processingGetConfig,
        processingAdditionalLogs,
        processingGetLogs,
    } = useSelector((state) => state.queryLogs, shallowEqual);
    const filter = useSelector((state) => state.queryLogs.filter, shallowEqual);
    const allLogs = useSelector((state) => state.queryLogs.allLogs, shallowEqual);

    const search = filter?.search || search_url_param;
    const response_status = filter?.response_status || response_status_url_param;

    const [isSmallScreen, setIsSmallScreen] = useState(window.innerWidth < SMALL_SCREEN_SIZE);
    const [detailedDataCurrent, setDetailedDataCurrent] = useState({});
    const [buttonType, setButtonType] = useState(BLOCK_ACTIONS.BLOCK);
    const [isModalOpened, setModalOpened] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const closeModal = () => setModalOpened(false);

    useEffect(() => {
        (async () => {
            setIsLoading(true);
            await dispatch(setFilteredLogs({
                search,
                response_status,
            }));
            setIsLoading(false);
        })();
    }, [response_status, search]);

    const mediaQuery = window.matchMedia(`(max-width: ${SMALL_SCREEN_SIZE}px)`);
    const mediaQueryHandler = (e) => {
        setIsSmallScreen(e.matches);
        if (e.matches) {
            dispatch(toggleDetailedLogs(false));
        }
    };

    useEffect(() => {
        try {
            mediaQuery.addEventListener('change', mediaQueryHandler);
        } catch (e1) {
            try {
                // Safari 13.1 do not support mediaQuery.addEventListener('change', handler)
                mediaQuery.addListener(mediaQueryHandler);
            } catch (e2) {
                console.error(e2);
            }
        }

        (async () => {
            setIsLoading(true);
            dispatch(getFilteringStatus());
            dispatch(getClients());
            try {
                await Promise.all([
                    dispatch(getLogsConfig()),
                    dispatch(getDnsConfig()),
                ]);
            } catch (err) {
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        })();

        return () => {
            try {
                mediaQuery.removeEventListener('change', mediaQueryHandler);
            } catch (e1) {
                try {
                    mediaQuery.removeListener(mediaQueryHandler);
                } catch (e2) {
                    console.error(e2);
                }
            }

            dispatch(resetFilteredLogs());
        };
    }, []);

    const refreshLogs = async () => {
        setIsLoading(true);
        await Promise.all([
            dispatch(refreshFilteredLogs()),
        ]);
        dispatch(addSuccessToast('query_log_updated'));
        setIsLoading(false);
    };

    const renderRow = ({
        rowProps,
        style,
    }) => <Row
            style={style}
            rowProps={rowProps}
            isSmallScreen={isSmallScreen}
            setDetailedDataCurrent={setDetailedDataCurrent}
            setButtonType={setButtonType}
            setModalOpened={setModalOpened}
    />;

    renderRow.propTypes = {
        rowProps: propTypes.object.isRequired,
        style: propTypes.object.isRequired,
    };

    const renderPage = () => <>
        <Filters
                filter={{
                    response_status,
                    search,
                }}
                setIsLoading={setIsLoading}
                processingGetLogs={processingGetLogs}
                processingAdditionalLogs={processingAdditionalLogs}
                refreshLogs={refreshLogs}
        />
        <InfiniteTable
                isLoading={isLoading}
                items={allLogs}
                renderRow={renderRow}
        />
        <Modal portalClassName='grid' isOpen={isSmallScreen && isModalOpened}
               onRequestClose={closeModal}
               style={{
                   content: {
                       width: '100%',
                       height: 'fit-content',
                       left: 0,
                       top: 47,
                       padding: '1rem 1.5rem 1rem',
                   },
                   overlay: {
                       backgroundColor: 'rgba(0,0,0,0.5)',
                   },
               }}
        >
            <svg
                    className="icon icon--24 icon-cross d-block d-md-none cursor--pointer"
                    onClick={closeModal}>
                <use xlinkHref="#cross" />
            </svg>
            {processContent(detailedDataCurrent, buttonType)}
        </Modal>
    </>;

    return <>
        {enabled && processingGetConfig && <Loading />}
        {enabled && !processingGetConfig && renderPage()}
        {!enabled && !processingGetConfig && <Disabled />}
    </>;
};

export default Logs;
