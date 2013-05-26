<?php

$stratumProxy = "proxy_server_url";
$workerName = "worker_name";
$workerPass = "worker_pass";

$data_string = file_get_contents('php://input');

$ch = curl_init($stratumProxy);
curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "POST");
curl_setopt($ch, CURLOPT_USERPWD, $workerName.":".$workerPass);
curl_setopt($ch, CURLOPT_POSTFIELDS, $data_string);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, array(
    'Content-Type: application/json',                                                                                
    'Content-Length: ' . strlen($data_string))                                                                       
);

echo curl_exec($ch);


?>
