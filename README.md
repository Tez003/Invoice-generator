# Invoice-generator



Node js
App.js/Index.js=> starting point

Invoice generator uses
MongoDB=> database (non relational database)


Relational Database=> Mysql, oracle sql



Login/Register


Register route=> First opens up a form..
Email
Phone number

Login route=> logging in is done based on OTP.
Email Id => 
I will check my database => phone number..
Phone number => send an OTP.

Let the nodes handle the rest of the login..
You have to verify.. If the OTP entered is same the OTP sent by the server.

Once the OTP is verified we redirect to user profile.

User profile has only the user details and the logout button and the invoice creation button.






/invoice creation

Before creating an invoice we have to check if the user is logged in, 
Once logged in...

Go to the invoices page
We will display the list of all the previous invoices.

Create new button is available
Once you click on that...
Open the form for invoice data.

Fill the form and add the client.

At any point you can edit the client detail

At any point you can also remove the client from the database.




/products adding

Say you opened one client's invoices.
You get an option to add products.(this is like creating a new invoice)

Here again we will open a form
We take 
Product name, quantity and price..

Add more products button => add multiple products.
Every corresponding product has a delete button.

There is a button called create pdf.
It will just open a new page where you have an option to download the PDF format of the created invoice...
At some point you also might have to edit this invoice..
So there is an edit button which takes you to the edit page of the invoice
Or else you can download the invoice.












