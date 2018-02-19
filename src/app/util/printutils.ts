import { CarOrder, OrderBill, UserOrder } from '../model/egg.model';

export function printString(content: string): void {
  const popupWin = window.open('', '_blank', 'top=0,left=0,height=100%,width=auto');
  popupWin.document.open();
  popupWin.document.write(`
      <html>
        <head>
          <title>打印</title>
          <style>
          //........Customized style.......
          </style>
        </head>
        <body onload="window.print();">${content}</body>
      </html>`
  );
  popupWin.document.close();
}

export function printUserOrder(order: UserOrder, bill: OrderBill) {
  const content = `
<pre style="padding:5px;margin:0px;">
  单号: ${order.id}\t时间: ${order.createdAt.substr(0, 10)}\t姓名: ${order.seller}
  数量: ${bill.totalCount}\t总重: ${bill.totalWeight}\t平均重量: ${bill.meanWeight}
</pre>
<pre style="margin:0px;padding:15px;white-space:pre-wrap;">
${getBillItemString(bill)}
</pre>
`
  printString(content)
}

export function printCarOrder(order: CarOrder, bill: OrderBill) {
  const content = `
<pre style="padding:5px;margin:0px;">
  单号: ${order.id}\t时间: ${order.createdAt.substr(0, 10)}\t姓名: ${order.driver}
  数量: ${bill.totalCount}\t总重: ${bill.totalWeight}\t平均重量: ${bill.meanWeight}
</pre>
<pre style="margin:0px;padding:15px;white-space:pre-wrap;">
${getBillItemString(bill)}
</pre>
`
  printString(content)
}

function getBillItemString(bill: OrderBill) {
  if (bill && bill.items) {
    return bill.items.map(item => {
      return `${item.weight}:${item.price ? item.price : '无'}`
    }).join('\t')
  } else {
    return '无'
  }
}
