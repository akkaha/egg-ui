import * as math from 'mathjs';

import { BillItem, PrintConfig } from './egg.model';

export class PrintTable {
  totalWeight = '0'
  meanWeight = '0'
  totalPrice = '0'
  meanPrice = '0'
  weightAdjustStr = ''
  rows = []
  cols = []
  items: BillItem[] = []
  config: PrintConfig

  constructor(config: PrintConfig, weightAdjustStr: string) {
    this.config = config
    this.weightAdjustStr = weightAdjustStr
  }

  w(r: number, c: number) {
    const i = r * this.config.colCount + c
    const item = this.items[i]
    if (item) {
      if (this.config.showItemPrice) {
        return `${item.weight} - ${item.price}元`
      } else {
        return item.weight
      }
    } else {
      return ''
    }
  }

  meanWeightResult() {
    if (this.meanWeight && this.weightAdjustStr) {
      const a = math.bignumber(math.eval(this.meanWeight))
      const b = math.bignumber(math.eval(this.weightAdjustStr))
      return ' = ' + math.add(a, b) + ' 斤'
    } else {
      return ''
    }
  }
}

export function toPrintTables(config: PrintConfig, items: BillItem[], weightAdjustStr: string): PrintTable[] {
  const tables: PrintTable[] = []
  let nums = []
  const tmp = {}
  config.weightGroups.trim()
    .replace(/\s+/g, ' ')
    .split(/\s/g)
    .forEach(s => {
      if (!tmp[s]) {
        tmp[s] = true
        nums.push(parseInt(s, 10))
      }
    })
  if (nums.length > 0 && items && items.length > 0) {
    nums = nums.sort(function (numA, numB) { return numA - numB })
    items.forEach(item => {
      let i = 0
      for (; i < nums.length; ++i) {
        const weight = math.bignumber(math.eval(item.weight))
        const curWeight = math.bignumber(math.eval(nums[i]))
        if (math.subtract(weight, curWeight) <= 0) {
          break
        }
      }
      let table = tables[i]
      if (!table) {
        table = new PrintTable(config, weightAdjustStr)
        tables[i] = table
      }
      table.items.push(item)
      table.totalPrice = math.add(math.bignumber(math.eval(table.totalPrice)), math.bignumber(math.eval(item.price || '0'))).toString()
      table.totalWeight = math.add(math.bignumber(math.eval(table.totalWeight)), math.bignumber(math.eval(item.weight || '0'))).toString()
    })
    tables.forEach(table => {
      const totalWeight = math.bignumber(math.eval(table.totalWeight))
      const totalPrice = math.bignumber(math.eval(table.totalPrice))
      const length = math.bignumber(math.eval(table.items.length.toString()))
      table.meanWeight = Number.parseFloat(math.divide(totalWeight, length).toString()).toFixed(2)
      table.meanPrice = Number.parseFloat(math.divide(totalPrice, length).toString()).toFixed(2)
      table.cols.length = config.colCount
      table.rows.length = Math.ceil(table.items.length / config.colCount)
    })
  }
  return tables.filter(table => !!table)
}
