export function print(content: string): void {
    let popupWin = window.open('', '_blank', 'top=0,left=0,height=100%,width=auto');
    popupWin.document.open();
    popupWin.document.write(`
      <html>
        <head>
          <title>打印</title>
          <style>
          //........Customized style.......
          </style>
        </head>
        <body onload="window.print();window.close()">${content}</body>
      </html>`
    );
    popupWin.document.close();
}