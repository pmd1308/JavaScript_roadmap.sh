function SelectCellsatAColumnbyInterval() {
    var ui = SpreadsheetApp.getUi();
    
    // Colunas
    var response = ui.prompt('Selecione as colunas que deseja selecionar', ui.ButtonSet.OK_CANCEL);
    if (response.getSelectedButton() == ui.Button.Cancel) return;
    var column = response.getResponseText().toUpperCase();

    // Intervalo
    response = ui.prompt('Selecione o intervalo', ui.ButtonSet.OK_CANCEL);
    if (response.getSelectedButton() == ui.Button.Cancel) return;
    var interval = parseInt(response.getResponseText());
    if (isNaN(interval) || interval < 0) {
        ui.alert('Intervalo inválido');
        return;
    }

    // Opções
    var result = ui.alert('Apenas seleção ou deseja adicionar um valor?', ui.ButtonSet.YES_NO);
    var action = result === ui.Button.YES ? 'selecionar' : 'definir valor';

    // Valor desejado
    var value = null;
    if (action == 'definir valor') {
        response = ui.prompt('Digite o valor desejado', ui.ButtonSet.OK_CANCEL);
        if (response.getSelectedButton() == ui.Button.Cancel) return;
        value = response.getResponseText();
    }

    // Referencia
    var sheet = SpreadsheetApp.getActiveSheet();
    
    // Calcula a seleção
    var rangeList = [];
    var columnIndex = column.charCodeAt(0) - 64; // Converte, pois na tabela ASCII, as letras começam no 64, tipo A = 64
    for (var i = 1; i <= sheet.getMaxRows(); i += n) {
        rangeList.push(sheet.getRange(i, columnIndex).getA1Notaion());
    } 

    // Seleção
    sheet.setActiveRangeList(sheet.getRangeList(rangeList))

    // Define valores
    if (action == "definir valor" && value !== null) {
        rangeList.forEach(function(range) { 
            sheet.getRange(range).setValue(value);
        });
    }

    ui.alert("Terminado")
}