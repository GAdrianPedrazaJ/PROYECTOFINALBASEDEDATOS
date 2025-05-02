<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Consulta de Pedidos</title>
<link rel="stylesheet" href="estilos_estado.css">
</head>
<body>
<div class="container">
  <h2 class="estimado">Estimado cliente</h2>
  <p>Pensando en su comodidad y tiempo hemos preparado para usted esta sección donde podrás consultar información sobre su pedido.</p>
  <p>¿Cómo puedes consultar la información? </p>
    <p>Para poder consultar información del pedido debes tener en cuenta el número de CÓDIGO DE PAGO con el cual realizaste el pago correspondiente.</p>
    <label for="codigoPago">Ingrese aquí tu código de pago:</label>
    <div class="input-container">
    
    <input type="text" id="codigoPago" class="input-field" placeholder="Ingrese aquí tu código de pago">
    <button id="realizarConsulta" class="button">Realizar Consulta</button>
  </div>
  <table>
    <thead>
      <tr>
        <th>Código de Pago</th>
        <th>Proceso de Pago</th>
        <th>Estado del Pedido</th>
        <th>Porcentaje Desarrollado</th>
        <th>Fecha de Entrega</th>
      </tr>
      <td class="vacia"></td>
      <td class="vacia"></td>
      <td class="vacia"></td>
      <td class="vacia"></td>
      <td class="vacia"></td>
    </thead>
    <tbody id="resultadoConsulta">
      <!-- Los resultados de la consulta se mostrarán aquí -->
    </tbody>
  </table>
</div>

<script>
document.getElementById('realizarConsulta').addEventListener('click', function() {
  var codigo = document.getElementById('codigoPago').value;
  
  // Validar que el código de pago solo contenga números enteros
  if (!/^\d+$/.test(codigo)) {
    alert('Por favor, ingrese solo números enteros en el campo de código de pago.');
    return;
  }
  
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      document.getElementById('resultadoConsulta').innerHTML = this.responseText;
    }
  };
  xhttp.open("GET", "conexion.php?codigo=" + codigo, true);
  xhttp.send();
});

</script>
</body>


</html>





