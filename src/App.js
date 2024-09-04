import React, { useState, useRef } from 'react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import Logo from './image/logo.JPG'; 

const App = () => {
  const invoiceRef = useRef();

  // State for form inputs
  const [invoiceData, setInvoiceData] = useState({
    customerName: '',
    customerPhone: '',
    items: [
      { description: '', rate: 0, quantity: 0, amount: 0 },
    ],
    total: 0,
    paid: 0,
    balanceDue: 0,
  });

  // Function to handle changes in form inputs
  const handleInputChange = (e, index = null) => {
    const { name, value } = e.target;

    if (name.includes('item')) {
      const items = [...invoiceData.items];
      const fieldName = name.split('-')[1];
      items[index][fieldName] = fieldName === 'description' ? value : parseFloat(value) || 0;

      // Recalculate amounts
      const updatedItems = items.map(item => ({
        ...item,
        amount: item.rate * item.quantity,
      }));

      // Recalculate total and set paid to match total
      const total = updatedItems.reduce((sum, item) => sum + item.amount, 0);

      setInvoiceData(prevData => ({
        ...prevData,
        items: updatedItems,
        total,
        paid: total,  // Set paid equal to total
        balanceDue: 0, // Balance Due always 0
      }));
    } else {
      // Update general invoice data (e.g., customerName, customerPhone)
      setInvoiceData(prevData => ({
        ...prevData,
        [name]: value,
      }));
    }
  };

  const handleAddItem = () => {
    const newItem = { description: '', rate: 0, quantity: 1, amount: 0 };
    setInvoiceData(prevData => ({
      ...prevData,
      items: [...prevData.items, newItem],
    }));
  };

  const handleDownloadPDF = async () => {
    const element = invoiceRef.current;
    const canvas = await html2canvas(element);
    const imageData = canvas.toDataURL('image/png');

    const pdf = new jsPDF('portrait', 'pt', 'a4');
    pdf.addImage(imageData, 'PNG', 0, 0, pdf.internal.pageSize.getWidth(), pdf.internal.pageSize.getHeight());
    pdf.save('invoice.pdf');
  };

  const getCurrentDate = () => {
    const date = new Date();
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
  };

  return (
    <div className="p-4">
      {/* Form for inputting invoice data */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Create Invoice</h2>
        <div className="grid grid-cols-2 gap-4">
          <input
            type="text"
            name="customerName"
            value={invoiceData.customerName}
            onChange={handleInputChange}
            placeholder="Customer Name"
            className="p-2 border border-gray-300 rounded"
          />
          <input
            type="text"
            name="customerPhone"
            value={invoiceData.customerPhone}
            onChange={handleInputChange}
            placeholder="Customer Phone"
            className="p-2 border border-gray-300 rounded"
          />
        </div>

        <div className="mt-4">
          {invoiceData.items.map((item, index) => (
            <div key={index} className="grid grid-cols-4 gap-4 mb-2">
              <input
                type="text"
                name={`item-description`}
                value={item.description}
                onChange={(e) => handleInputChange(e, index)}
                placeholder="Description"
                className="p-2 border border-gray-300 rounded"
              />
              <input
                type="number"
                name={`item-rate`}
                value={item.rate}
                onChange={(e) => handleInputChange(e, index)}
                placeholder="Rate"
                className="p-2 border border-gray-300 rounded"
              />
              <input
                type="number"
                name={`item-quantity`}
                value={item.quantity}
                onChange={(e) => handleInputChange(e, index)}
                placeholder="Quantity"
                className="p-2 border border-gray-300 rounded"
              />
              <input
                type="number"
                name={`item-amount`}
                value={item.amount}
                disabled
                placeholder="Amount"
                className="p-2 border border-gray-300 rounded bg-gray-100"
              />
            </div>
          ))}
        </div>
        <button
          onClick={handleAddItem}
          className="mt-2 px-4 py-2 bg-green-500 text-white rounded-md"
        >
          Add Item
        </button>
      </div>

      {/* Display Invoice */}
      <div ref={invoiceRef} className="max-w-2xl mx-auto bg-white p-4 shadow-md rounded-lg">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <div className='w-20'>
              <img src={Logo} className='w-full' />
            </div>
            <h1 className="md:text-3xl text-[15px] font-bold">Stomach Care Food</h1>
            <p>89 Cooke Ave, Brantford, ON, Canada</p>
            <p>+1 (647) 705-5758</p>
          </div>
          <div>
            <h2 className="md:text-xl text-[15px] font-semibold">INVOICE</h2>
            <p>INVO001</p>
            <p>Date: {getCurrentDate()}</p>
            <p>Due: On Receipt</p>
          </div>
        </div>

        {/* Bill To Section */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold">Bill To:</h3>
          <p>{invoiceData.customerName}</p>
          <p>{invoiceData.customerPhone}</p>
        </div>

        {/* Items Table */}
        <table className="min-w-full bg-white mb-8">
          <thead>
            <tr>
              <th className="py-2 px-1 bg-gray-100">Description</th>
              <th className="py-2 px-1 bg-gray-100">Rate</th>
              <th className="py-2 px-1 bg-gray-100">Quantity</th>
              <th className="py-2 px-1 bg-gray-100">Amount</th>
            </tr>
          </thead>
          <tbody>
            {invoiceData.items.map((item, index) => (
              <tr key={index}>
                <td className="border-t border-gray-300 py-2 px-4">{item.description}</td>
                <td className="border-t border-gray-300 py-2 px-4">${item.rate.toFixed(2)}</td>
                <td className="border-t border-gray-300 py-2 px-4">{item.quantity}</td>
                <td className="border-t border-gray-300 py-2 px-4">${item.amount.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div className="text-right">
          <p className="text-lg font-semibold">Total: ${invoiceData.total.toFixed(2)}</p>
          <p className="text-lg font-semibold">Paid: ${invoiceData.paid.toFixed(2)}</p>
          <p className="text-lg font-semibold">Balance Due: ${invoiceData.balanceDue.toFixed(2)}</p>
        </div>
      </div>

      {/* Download Button */}
      <div className="mt-8 text-center">
        <button
          onClick={handleDownloadPDF}
          className="px-6 py-2 bg-blue-500 text-white rounded-md"
        >
          Download PDF
        </button>
      </div>
    </div>
  );
};

export default App;
