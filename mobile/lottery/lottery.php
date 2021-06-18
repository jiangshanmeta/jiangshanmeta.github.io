<?

$rand = rand(0,1);
$rst  =[];

if($rand == 0){
	$rst['rstno'] = 2;
	$rst['data']['err']['msg'] = 123;
	echo json_encode($rst);	
}else{
	$rst['rstno'] = 1;
	$rst['data']['index'] = rand(0,7);
	$rst['data']['err']['msg'] = ($rst['data']['index']+1).'等奖';
	echo json_encode($rst);	
}

?>