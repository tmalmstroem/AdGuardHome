/* eslint-disable */
/* todo uncomment */
import React, { useCallback, useEffect, useState } from 'react';
import { FixedSizeList } from 'react-window';
import InfiniteLoader from 'react-window-infinite-loader';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { Trans, useTranslation } from 'react-i18next';
import classNames from 'classnames';
import TestCell from './Cells/TestCell';
import { getLogs, toggleDetailedLogs } from '../../actions/queryLogs';
import {
    BLOCK_ACTIONS, DEFAULT_SHORT_DATE_FORMAT_OPTIONS,
    FILTERED_STATUS, FILTERED_STATUS_TO_META_MAP, LONG_TIME_FORMAT,
    QUERY_LOGS_SEARCH_LIMIT, SCHEME_TO_PROTOCOL_MAP,
    TABLE_DEFAULT_PAGE_SIZE,
} from '../../helpers/constants';
import Loading from '../ui/Loading';
import {
    captitalizeWords,
    checkFiltered,
    formatDateTime,
    formatElapsedMs,
    formatTime,
    processContent,
} from '../../helpers/helpers';
import { toggleBlocking } from '../../actions';
import { getSourceData } from '../../helpers/trackers/trackers';

const Header = () => {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const isDetailed = useSelector((state) => state.queryLogs.isDetailed);
    const onClickOff = () => dispatch(toggleDetailedLogs(false));
    const onClickOn = () => dispatch(toggleDetailedLogs(true));

    const HEADERS = [
        {
            className: 'logs__cell--date',
            content: 'time_table_header',
        },
        {
            className: 'logs__cell--domain',
            content: 'request_table_header',
        },
        {
            className: 'logs__cell--response',
            content: 'response_table_header',
        },
        {
            className: 'logs__cell--client',
            content: <>
                {t('client_table_header')}
                {<span>
                    <svg className={classNames('icons icon--24 icon--green cursor--pointer mr-2', { 'icon--selected': !isDetailed })}
                         onClick={onClickOff}
                    >
                    <title>{t('compact')}</title>
                    <use xlinkHref='#list' /></svg>
                <svg className={classNames('icons icon--24 icon--green cursor--pointer', { 'icon--selected': isDetailed })}
                     onClick={onClickOn}
                >
                    <title>{t('default')}</title>
                    <use xlinkHref='#detailed_list' />
                    </svg>
            </span>}
            </>,
        },
    ];

    const renderHeaders = ({ content, className }, idx) => <div
            key={idx}
            className={classNames('logs__cell--header__item logs__cell logs__text--bold', className)}>
        {typeof content === 'string' ? t(content) : content}
    </div>;

    return <div className="logs__cell--header__container px-5">
        {HEADERS.map(renderHeaders)}
    </div>;
};

const Example = (props) => {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const {
        isLoading, isSmallScreen, setDetailedDataCurrent,
        setButtonType,
        setModalOpened,
    } = props;

    // Are there more items to load?
    // (This information comes from the most recent API request.)
    const [hasNextPage, setHasNextPage] = useState(true);

    // Are we currently loading a page of items?
    // (This may be an in-flight flag in your Redux store for example.)
    const [isNextPageLoading, setIsNextPageLoading] = useState(false);

    const queryLogs = useSelector((state) => state.queryLogs, shallowEqual);
    const { allLogs } = queryLogs;

    const items = allLogs;
    // items = allLogs;
    // console.log(allLogs);
    // console.log(queryLogs);
    // If there are more items to be loaded then add an extra row to hold a loading indicator.

    const _loadNextPage = (...args) => {
        console.log('loadNextPage', ...args);
        setIsNextPageLoading(true);
        // page size
        setHasNextPage(allLogs.length < QUERY_LOGS_SEARCH_LIMIT);
        setIsNextPageLoading(false);

        // this.setState({ isNextPageLoading: true }, () => {
        //     setTimeout(() => {
        //         this.setState(state => ({
        //             hasNextPage: state.items.length < 100,
        //             isNextPageLoading: false,
        //             items: [...state.items].concat(
        //                     new Array(10).fill(true).map(() => ({ name: name.findName() }))
        //             )
        //         }));
        //     }, 2500);
        // });
    };

    const {
        isDetailed,
        processingGetLogs,
        oldest,
        page,
        pages,
        total,
    } = useSelector((state) => state.queryLogs, shallowEqual);
    // const processingGetLogs = useSelector((state) => state.queryLogs.processingGetLogs);

    const itemCount = total;

    // Only load 1 page of items at a time.
    // Pass an empty callback to InfiniteLoader in case it asks us to load more than once.
    const loadMoreItems = () => {
        console.log('loadMoreItems');
        // console.log(oldest, page + 1);

        // const getLogs = (older_than, page, initial) => {
        //     if (enabled) {
        //         getLogs({
        //             older_than,
        //             page,
        //             pageSize: TABLE_DEFAULT_PAGE_SIZE,
        //             initial,
        //         });
        //     }
        // };
        // todo handle last page
        dispatch(getLogs({
            older_than: oldest,
            page,
        }));
    };


    // Every row is loaded except for our loading indicator row.
    const getIsItemLoaded = (index) => index < items.length - 1;

    // Render an item or a loading indicator.
    // const Item = ({ index, style }) => {
    //     let content;
    //     if (!getIsItemLoaded(index)) {
    //         content = 'Loading...';
    //     } else {
    //         content = items[index].time;
    //     }
    //
    //     return <div style={style}>{content}</div>;
    // };

    // const changePage = async (page) => {
    //     setIsLoading(true);
    //     console.log('changePage');
    //     const isLastPage = pages && (page + 1 === pages);
    //
    //     if (isLastPage) {
    //         dispatch(getLogs(oldest, page));
    //     }
    //
    //     setIsLoading(false);
    // };

    // todo test if this really produce optimization
    const Test = useCallback(TestCell, [items]);

    return <InfiniteLoader
            isItemLoaded={getIsItemLoaded}
            itemCount={itemCount}
            loadMoreItems={loadMoreItems}
    >
        {({ onItemsRendered, ref }) => <div className='logs__table'>
            {(isLoading || processingGetLogs) && <Loading />}
            <Header />
            {itemCount === 0 && !processingGetLogs
                ? <label className="logs__no-data logs__text--bold">{t('nothing_found')}</label>
                : <FixedSizeList
                            className="mw-100"
                            width={1176}
                            height={1600}
                            itemCount={itemCount}
                            itemSize={isDetailed ? 80 : 50}
                            onItemsRendered={onItemsRendered}
                            ref={ref}
                    >
                        {({
                            index,
                            style,
                        }) => <Test
                                style={style}
                                item={items?.[index]}
                                isSmallScreen={isSmallScreen}
                                setDetailedDataCurrent={setDetailedDataCurrent}
                                setButtonType={setButtonType}
                                setModalOpened={setModalOpened}
                        />}
                    </FixedSizeList>}
        </div>}
    </InfiniteLoader>;
};

export default Example;
