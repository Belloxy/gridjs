import { PipelineProcessor, ProcessorType } from '../processor';
import Tabular from '../../tabular';
import { ArrayResponse } from './storageResponseToArray';
import Row from '../../row';

class ArrayToTabularTransformer extends PipelineProcessor<
  Tabular,
  Record<string, any>
> {
  get type(): ProcessorType {
    return ProcessorType.Transformer;
  }

  _process(arrayResponse: ArrayResponse): Tabular {
    const tabular = Tabular.fromArray(arrayResponse.data);

    if (arrayResponse.extraData && arrayResponse.extraData.length > 0) {
      tabular.rows.forEach((row: Row, index: number) => {
        if (arrayResponse.extraData[index]) {
          row.extraData = arrayResponse.extraData[index];
        }
      });
    }

    // for server-side storage
    tabular.length = arrayResponse.total;

    return tabular;
  }
}

export default ArrayToTabularTransformer;
