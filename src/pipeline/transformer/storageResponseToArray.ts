import {
  PipelineProcessor,
  PipelineProcessorProps,
  ProcessorType,
} from '../processor';
import { StorageResponse } from '../../storage/storage';
import { TCell, TData, TDataArray, TDataObject, TwoDArray } from '../../types';
import Header from '../../header';
import logger from '../../util/log';

export interface ArrayResponse {
  data: TwoDArray<TCell>;
  extraData?: Array<{ [key: string]: any }>;
  total: number;
}

interface StorageResponseToArrayTransformerProps
  extends PipelineProcessorProps {
  header: Header;
}

class StorageResponseToArrayTransformer extends PipelineProcessor<
  ArrayResponse,
  StorageResponseToArrayTransformerProps
> {
  get type(): ProcessorType {
    return ProcessorType.Transformer;
  }

  private castData(data: TData): {
    data: TwoDArray<TCell>;
    extraData: Array<{ [key: string]: any }>;
  } {
    if (!data || !data.length) {
      return { data: [], extraData: [] };
    }

    if (!this.props.header || !this.props.header.columns) {
      return { data: data as TwoDArray<TCell>, extraData: [] };
    }

    const columns = Header.leafColumns(this.props.header.columns);

    // if it's a 2d array already
    if (data[0] instanceof Array) {
      const extraDataArray: Array<{ [key: string]: any }> = [];

      const mappedData = (data as TDataArray).map((row) => {
        let pad = 0;
        const extraData: { [key: string]: any } = {};
        const usedIndices = new Set<number>();

        const mappedRow = columns.map((column, i) => {
          // default `data` is provided for this column
          if (column.data !== undefined) {
            pad++;

            if (typeof column.data === 'function') {
              return column.data(row);
            } else {
              return column.data;
            }
          }

          const index = i - pad;
          usedIndices.add(index);

          return row[index];
        });

        row.forEach((value, index) => {
          if (!usedIndices.has(index)) {
            extraData[`col_${index}`] = value;
          }
        });

        extraDataArray.push(extraData);

        return mappedRow;
      });

      return { data: mappedData, extraData: extraDataArray };
    }

    // if it's an array of objects (but not array of arrays, i.e JSON payload)
    if (typeof data[0] === 'object' && !(data[0] instanceof Array)) {
      const extraDataArray: Array<{ [key: string]: any }> = [];

      const mappedData = (data as TDataObject).map((row) => {
        const columnIds = new Set<string>();
        const extraData: { [key: string]: any } = {};

        columns.forEach((column) => {
          if (column.id) {
            columnIds.add(column.id);
          }
        });

        Object.keys(row).forEach((key) => {
          if (!columnIds.has(key)) {
            extraData[key] = row[key];
          }
        });

        extraDataArray.push(extraData);

        return columns.map((column, i) => {
          if (column.data !== undefined) {
            if (typeof column.data === 'function') {
              return column.data(row);
            } else {
              return column.data;
            }
          } else if (column.id) {
            return row[column.id];
          } else {
            logger.error(`Could not find the correct cell for column at position ${i}.
                          Make sure either 'id' or 'selector' is defined for all columns.`);
            return null;
          }
        });
      });

      return { data: mappedData, extraData: extraDataArray };
    }

    return { data: [], extraData: [] };
  }

  _process(storageResponse: StorageResponse): ArrayResponse {
    const result = this.castData(storageResponse.data);
    return {
      data: result.data,
      total: storageResponse.total,
      extraData: result.extraData,
    };
  }
}

export default StorageResponseToArrayTransformer;
