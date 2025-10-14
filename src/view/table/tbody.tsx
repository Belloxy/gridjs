import { h } from 'preact';
import Row from '../../row';
import { TR } from './tr';
import { classJoin, className } from '../../util/className';
import { Status } from '../../types';
import { MessageRow } from './messageRow';
import { useConfig } from '../../hooks/useConfig';
import { useTranslator } from '../../i18n/language';
import useSelector from '../../hooks/useSelector';

export function TBody() {
  const config = useConfig();
  const data = useSelector((state) => state.data);
  const status = useSelector((state) => state.status);
  const header = useSelector((state) => state.header);
  const pagination = useSelector((state) => state.pagination);
  const _ = useTranslator();

  const headerLength = () => {
    if (header) {
      return header.visibleColumns.length;
    }
    return 0;
  };

  const getPaginationOffset = () => {
    if (!pagination || !config.pagination) {
      return 0;
    }

    const { page = 0, limit = 10 } = pagination;

    if (limit === -1) {
      return 0;
    }

    return page * limit;
  };

  const paginationOffset = getPaginationOffset();

  return (
    <tbody className={classJoin(className('tbody'), config.className.tbody)}>
      {data &&
        data.rows.map((row: Row, index: number) => {
          return <TR index={paginationOffset + index} row={row} />;
        })}

      {status === Status.Loading && (!data || data.length === 0) && (
        <MessageRow
          message={_('loading')}
          colSpan={headerLength()}
          className={classJoin(className('loading'), config.className.loading)}
        />
      )}

      {(status === Status.Rendered || status === Status.Loaded) &&
        data &&
        data.length === 0 && (
          <MessageRow
            message={_('noRecordsFound')}
            colSpan={headerLength()}
            className={classJoin(
              className('notfound'),
              config.className.notfound,
            )}
          />
        )}

      {status === Status.Error && (
        <MessageRow
          message={_('error')}
          colSpan={headerLength()}
          className={classJoin(className('error'), config.className.error)}
        />
      )}
    </tbody>
  );
}
