import React from 'react';
import { FixedSizeList } from 'react-window';
import InfiniteLoader from 'react-window-infinite-loader';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import propTypes from 'prop-types';
import AutoSizer from 'react-virtualized-auto-sizer';
import Loading from '../ui/Loading';
import Header from './Cells/Header';
import { getLogs } from '../../actions/queryLogs';

const CELL_HEIGHT = 50;
const DETAILED_CELL_HEIGHT = 80;
const OVERSCAN_COUNT = 25;

const InfiniteTable = ({
    isLoading,
    renderRow,
    items,
}) => {
    const { t } = useTranslation();
    const dispatch = useDispatch();

    const {
        isDetailed,
        isEntireLog,
        processingGetLogs,
        oldest,
    } = useSelector((state) => state.queryLogs, shallowEqual);

    // todo handle markup of the last 'page'
    const loadMoreItems = () => dispatch(getLogs({ older_than: oldest }));

    const getIsItemLoaded = (index) => isEntireLog || index < items.length - 1;

    const Row = ({
        index,
        style,
    }) => renderRow({
        rowProps: items?.[index],
        style,
    });

    const itemCount = items.length;

    return <div className='logs__table' role='grid'>
        {(isLoading || processingGetLogs) && <Loading />}
        <Header />
        {itemCount === 0 && !processingGetLogs
            ? <label className="logs__no-data">{t('nothing_found')}</label>
            : <AutoSizer>
                    {({ height, width }) => <InfiniteLoader
                            isItemLoaded={getIsItemLoaded}
                            itemCount={itemCount}
                            loadMoreItems={loadMoreItems}
                    >
                        {({ onItemsRendered, ref }) => <FixedSizeList
                                width={width}
                                height={height}
                                itemCount={itemCount}
                                itemSize={isDetailed ? DETAILED_CELL_HEIGHT : CELL_HEIGHT}
                                onItemsRendered={onItemsRendered}
                                ref={ref}
                                overscanCount={OVERSCAN_COUNT}
                        >
                            {Row}
                        </FixedSizeList>}
                    </InfiniteLoader>}
                </AutoSizer>}
    </div>;
};

InfiniteTable.propTypes = {
    isLoading: propTypes.bool.isRequired,
    renderRow: propTypes.func.isRequired,
    items: propTypes.array.isRequired,
};

export default InfiniteTable;
