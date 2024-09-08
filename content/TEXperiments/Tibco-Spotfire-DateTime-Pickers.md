+++
title = "TIBCO Spotfire - Date and Time Pickers"
description = "TIBCO Spotfire® provides is the ability to incorporate date-time pickers in the dashboards without the need for any libraries such as JQuery or complex date-picker functions."
date = "2019-08-23"
aliases = ["data analysis", "data", "date-time"]
tags = ["tibco", "data-visualization", "data-analytics", "analytics", "data science", "spotfire"]
author = "Akash Mahapatra"
+++
\
\
{{< figure src="/images/sf-datetime/1.webp" >}}



TIBCO Spotfire® Software is the most complete analytics solution available in the market, empowering enterprises to investigate and envision new revelations in information through vivid dashboards and in-depth investigations.

With TIBCO Spotfire® it becomes extremely easy to connect business data and design the relevant analysis solutions for enterprises, dramatically **_reducing the time to access vital data_** to identify areas to increase profits.

TIBCO Spotfire® takes ease to the next level in order to help businesses and enterprises focus on the information rather than spending time to design proper analytics to get information from raw data. Its advanced AI-based system prompts users to get the relevant visualizations based on the underlying data and provides various tools to zoom into a specific region in the visualization to dig deeper into the data.

In this effort for bringing ease of use to the table, another great feature that TIBCO Spotfire® provides is the ability to incorporate date-time pickers in the dashboards without the need for any libraries such as JQuery or complex date-picker functions. These inputs can be enhanced by converting them into HTML5 date pickers by adding the proper type attribute on the input HTML tag with some javascript.

---

## Using Date and Time Pickers in TIBCO Spotfire®
TIBCO Spotfire® provides a text area under the visualization types which can be edited as an HTML file. Below are the steps to achieve the results:

1. Right Click on the Text Area and select “Edit HTML”

{{< figure src="/images/sf-datetime/2.webp" width="70%" height="auto" >}}

2. In the HTML text box that opens, copy and paste the below code snippet

```
Date
<span id="date">
   <SpotfireControl id="a7bc72fe047f456aa9ec859bc4029640" />
</span>
Time
<span id="time">
  <SpotfireControl id="4a72bc5108ed483cb4715318bc61da3d" />
</span>
Datetime
<span id="datetime">
   <SpotfireControl id="5c5b47d14865443dbcbf19ca8091d884" />
</span>
```

3. To generate the specific SpotfireControl id, put your cursor on a new line below the span tag. Click on “Insert Property Control” and select “Input Field” to open the “Property Control” wizard.

{{< figure src="/images/sf-datetime/3.webp" width="60%" height="auto" >}}
<br /> 

{{< figure src="/images/sf-datetime/4.webp" width="60%" height="auto" >}}
<br /> 

{{< figure src="/images/sf-datetime/5.webp" width="60%" height="auto" >}}

4. Click on the New button to create a new property and provide necessary details such as data type and default values as required.

{{< figure src="/images/sf-datetime/6.webp" width="60%" height="auto" >}}

5. Once the properties are configured, we will be able to see all the properties together on the text pad.
{{< figure src="/images/sf-datetime/7.webp" width="60%" height="auto" >}}

6. Next, click on the “Insert JavaScript” option and click on the New button
{{< figure src="/images/sf-datetime/8.webp" width="60%" height="auto" >}}

7. Use the below script in the new text pad that appears. Give the script a name and save it.
```
[...document.querySelectorAll(".date input")].map(x => x.type="date");
[...document.querySelectorAll(".time input")].map(x => x.type="time");
[...document.querySelectorAll(".datetime input")].map(x => x.type="datetime-local");
```

8. Finally the HTML code snippet along with the properties and Javascript should look like this:
{{< figure src="/images/sf-datetime/9.webp" width="60%" height="auto" >}}

9. Save this HTML code snippet and the Date Time picker is ready.
{{< figure src="/images/sf-datetime/10.webp" width="60%" height="auto" >}}

It is now easier and almost out of the box to use different date pickers for date, time, or even date-time by using the power of HTML5. No jquery or other libraries needed

---

## References:
1. [TIBCO Community: Date and Time Pickers](https://community.tibco.com/wiki/date-and-time-pickers)
2. https://developer.mozilla.org/en-US/docs/Learn/Forms/HTML5_input_types#date_and_time_pickers


{{< figure src="/images/sf-datetime/11.webp" >}}
