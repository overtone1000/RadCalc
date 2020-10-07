<?php
$counter_file = fopen("count.txt", "r+");
$count = intval(fread($counter_file, filesize("count.txt")));
$console_str = "console.log(".$count." + \" visitors\")";
echo "<script>".$console_str."</script>";
?>