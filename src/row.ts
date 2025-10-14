import Cell from './cell';
import Base from './base';
import { TCell } from './types';

class Row extends Base {
  private _cells: Cell[];
  private _extraData: { [key: string]: any };

  constructor(cells?: Cell[], extraData?: { [key: string]: any }) {
    super();

    this.cells = cells || [];
    this._extraData = extraData || {};
  }

  public cell(index: number): Cell {
    return this._cells[index];
  }

  public get cells(): Cell[] {
    return this._cells;
  }

  public set cells(cells: Cell[]) {
    this._cells = cells;
  }

  public get extraData(): { [key: string]: any } {
    return this._extraData;
  }

  public set extraData(extraData: { [key: string]: any }) {
    this._extraData = extraData;
  }

  public getExtraData(key: string): any {
    return this._extraData[key];
  }

  public setExtraData(key: string, value: any): void {
    this._extraData[key] = value;
  }

  public toArray(): TCell[] {
    return this.cells.map((cell) => cell.data);
  }

  /**
   * Creates a new Row from an array of Cell(s)
   * This method generates a new ID for the Row and all nested elements
   *
   * @param cells
   * @param extraData
   * @returns Row
   */
  static fromCells(cells: Cell[], extraData?: { [key: string]: any }): Row {
    return new Row(
      cells.map((cell) => new Cell(cell.data)),
      extraData,
    );
  }

  get length(): number {
    return this.cells.length;
  }
}

export default Row;
