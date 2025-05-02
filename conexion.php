<?php
// Conexión a la base de datos (asegúrate de reemplazar con tus propios valores)
$servername = "localhost";
$port = 8080;
$username = "root";
$password = "";
$database = "manillania";

$conn = new mysqli($servername, $username, $password, $database, $port);

if ($conn->connect_error) {
    die("La conexión ha fallado: " . $conn->connect_error);
}

// Obtén el código de pago de la solicitud
$codigoPago = $_GET['codigo'];

// Consulta a la base de datos
$sql = "SELECT * FROM estado_pedido WHERE codigo_pago = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("s", $codigoPago);
$stmt->execute();
$result = $stmt->get_result();

// Genera la fila de la tabla con los datos de la base de datos
if ($result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
        echo "<tr>";
        echo "<td>" . $row['codigo_pago'] . "</td>";
        echo "<td>" . $row['proceso_pago'] . "</td>";
        echo "<td>" . $row['estado_pedido'] . "</td>";
        echo "<td>" . $row['porcentaje'] . "</td>";
        echo "<td>" . $row['fecha_entrega'] . "</td>";
        echo "</tr>";
    }
} else {
    echo "<tr><td colspan='5'>No se encontraron resultados</td></tr>";
}

$conn->close();
?>
