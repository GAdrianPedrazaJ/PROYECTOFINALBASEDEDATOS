<?php
$servername = "localhost";
$username = "root"; // El usuario por defecto en XAMPP es "root"
$password = ""; // La contraseña por defecto en XAMPP es una cadena vacía
$dbname = "registros";

// Crear conexión
$conn = new mysqli($servername, $username, $password, $dbname);

// Verificar conexión
if ($conn->connect_error) {
    die("Conexión fallida: " . $conn->connect_error);
}

// Obtener los datos del formulario
$nombre = $_POST['nombre'];
$gmail = $_POST['gmail'];
$contrasena = $_POST['password'];
$telefono = $_POST['telefono'];
$fecha_nacimiento = $_POST['fecha_nacimiento'];
$direccion = $_POST['direccion'];
$departamento = $_POST['departamento'];
$ciudad = $_POST['ciudad'];
$codigo_postal = $_POST['codigo_postal'];

// Insertar los datos en la tabla
$sql = "INSERT INTO usuarios (nombre, gmail, contrasena, telefono, fecha_nacimiento, direccion, departamento, ciudad, codigo_postal)
VALUES ('$nombre', '$gmail', '$contrasena', '$telefono', '$fecha_nacimiento', '$direccion', '$departamento', '$ciudad', '$codigo_postal')";

if ($conn->query($sql) === TRUE) {
    echo "Nuevo registro creado con éxito";
} else {
    echo "Error: " . $sql . "<br>" . $conn->error;
}

$conn->close();
?>
