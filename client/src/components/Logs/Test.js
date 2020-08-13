/* eslint-disable react/prop-types */
import React, { useCallback } from 'react';
import { FixedSizeList } from 'react-window';
import InfiniteLoader from 'react-window-infinite-loader';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { Trans, useTranslation } from 'react-i18next';
import classNames from 'classnames';
import TestCell from './Cells/TestCell';
import { toggleDetailedLogs } from '../../actions/queryLogs';

const Header = () => {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const isDetailed = useSelector((state) => state.queryLogs.isDetailed);
    const onClickOff = () => dispatch(toggleDetailedLogs(false));
    const onClickOn = () => dispatch(toggleDetailedLogs(true));

    return <div className="d-flex logs__cell--header__container">
        <div className="logs__cell--header__item logs__cell logs__cell--date logs__text--bold">{t('time_table_header')}</div>
        <div className="logs__cell--header__item logs__cell logs__cell--domain logs__text--bold">{t('request_table_header')}</div>
        <div className="logs__cell--header__item logs__cell logs__cell--response logs__text--bold">{t('response_table_header')}</div>
        <div className="logs__cell--header__item logs__cell d-flex justify-content-between logs__cell--client logs__text--bold">{t('client_table_header')}
            {<span>
                        <svg
                                className={classNames('icons icon--24 icon--green mr-2 cursor--pointer', {
                                    'icon--selected': !isDetailed,
                                })}
                                onClick={onClickOff}
                        >
                            <title><Trans>compact</Trans></title>
                            <use xlinkHref='#list' />
                        </svg>
                    <svg
                            className={classNames('icons icon--24 icon--green cursor--pointer', {
                                'icon--selected': isDetailed,
                            })}
                            onClick={onClickOn}
                    >
                        <title><Trans>default</Trans></title>
                        <use xlinkHref='#detailed_list' />
                    </svg>
                        </span>}
        </div></div>;
};

function Example({
    // Are there more items to load?
    // (This information comes from the most recent API request.)
    hasNextPage = false,

    // Are we currently loading a page of items?
    // (This may be an in-flight flag in your Redux store for example.)
    isNextPageLoading = false,

    items = [],

    loadNextPage = () => {},
}) {
    const { t } = useTranslation();
    // todo remove
    // eslint-disable-next-line no-param-reassign
    // items = items.slice(0, 100);
    // const queryLogs = useSelector((state) => state.queryLogs, shallowEqual);
    // const { allLogs } = queryLogs;
    // items = allLogs;
    // console.log(allLogs);
    // console.log(queryLogs);
    // If there are more items to be loaded then add an extra row to hold a loading indicator.

    const {
        isDetailed,
        processingGetLogs,
    } = useSelector((state) => state.queryLogs, shallowEqual);
    // const processingGetLogs = useSelector((state) => state.queryLogs.processingGetLogs);

    const itemCount = hasNextPage ? items.length + 1 : items.length;

    // Only load 1 page of items at a time.
    // Pass an empty callback to InfiniteLoader in case it asks us to load more than once.
    const loadMoreItems = isNextPageLoading ? () => {} : loadNextPage;

    // Every row is loaded except for our loading indicator row.
    const isItemLoaded = (index) => !hasNextPage || index < items.length;

    // Render an item or a loading indicator.
    // const Item = ({ index, style }) => {
    //     let content;
    //     if (!isItemLoaded(index)) {
    //         content = 'Loading...';
    //     } else {
    //         content = items[index].time;
    //     }
    //
    //     return <div style={style}>{content}</div>;
    // };

    // todo test if this really produce optimization
    const Test = useCallback(TestCell, [items]);

    // todo implement dynamic loading of new items
    return <InfiniteLoader
            isItemLoaded={isItemLoaded}
            itemCount={itemCount}
            loadMoreItems={loadMoreItems}
    >
        {({ onItemsRendered, ref }) => (
                <div className="ReactTable logs__table logs__table--new logs__table--detailed">
                    <div className="rt-table px-5" role="grid">
                        <Header />
                        {itemCount === 0 && !processingGetLogs
                            ? <label className="logs__no-data logs__text--bold">{t('nothing_found')}</label>
                            : <FixedSizeList
                                width={1152}
                                height={2013}
                                itemCount={itemCount}
                                itemSize={isDetailed ? 80 : 50}
                                onItemsRendered={onItemsRendered}
                                ref={ref}
                        >
                            {({ index, style }) => <Test style={style} item={items?.[index]} />}
                        </FixedSizeList>}
                    </div>
                </div>
        )}
    </InfiniteLoader>;
}

export default Example;
