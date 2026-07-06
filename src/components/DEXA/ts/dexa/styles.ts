const warn_color="#857803";

// Change input styles if values are unusual
export function get_warn_style(warn:boolean)
{   
    let retval="border-radius:5px; padding:1px;";
    if(warn)
    {
        retval+=" background:"+warn_color+";";
    }
    return retval;
}

export function get_input_warn_style(warn:boolean)
{
    const warn_color="#857803";
    let retval="";
    if(warn)
    {
        retval+=" background:"+warn_color+";";
    }
    return retval;
}