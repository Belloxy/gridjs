import { h, JSX, ComponentChildren } from 'preact';

import Row from '../../row';
import Cell from '../../cell';
import { classJoin, className } from '../../util/className';
import { TAttribute, TColumn } from '../../types';
import { TD } from './td';
import Header from '../../header';
import { useConfig } from '../../hooks/useConfig';
import useSelector from '../../hooks/useSelector';

export function TR(props: {
  index?: number;
  row?: Row;
  messageRow?: boolean;
  children?: ComponentChildren;
}) {
  const config = useConfig();
  const header = useSelector((state) => state.header);

  const getColumn = (cellIndex: number): TColumn => {
    if (header) {
      const cols = Header.leafColumns(header.columns);

      if (cols) {
        return cols[cellIndex];
      }
    }

    return null;
  };

  const handleClick = (
    e: JSX.TargetedMouseEvent<HTMLTableRowElement>,
  ): void => {
    if (props.messageRow) return;
    config.eventEmitter.emit('rowClick', e, props.row);
  };

  const getChildren = (): ComponentChildren => {
    if (props.children) {
      return props.children;
    }

    return props.row.cells.map((cell: Cell, i) => {
      const column = getColumn(i);

      if (column && column.hidden) return null;

      return <TD key={cell.id} cell={cell} row={props.row} column={column} />;
    });
  };

  const customAttributes: TAttribute = (
    config.rowAttribute instanceof Function
      ? config.rowAttribute(props.row)
      : config.rowAttribute
  ) as TAttribute;

  const { class: customClass, ...attributes } = customAttributes;

  return (
    <tr
      className={classJoin(className('tr'), config.className.tr, customClass)}
      onClick={handleClick}
      {...attributes}
    >
      {getChildren()}
    </tr>
  );
}
