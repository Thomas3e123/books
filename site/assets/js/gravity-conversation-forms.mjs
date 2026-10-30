export const forms = {
  "guestrecovery": {
    "name": "Guest Recovery Record",
    "fields": [
      "Guest Concern",
      "Facts",
      "Immediate Recovery",
      "Comp/Refund",
      "Manager Follow-Up",
      "Root Cause",
      "Prevention"
    ],
    "source": "/gravity-document-studio",
    "sourceSha256": "ccc5a8a1c594fea68a793a409bf274e4e1a986a866cdc0f24111b9a86e59b275"
  },
  "waste": {
    "name": "Waste / Spill / Comp Log",
    "fields": [
      "Date/Time",
      "Item",
      "Quantity",
      "Cost",
      "Reason",
      "Disposition",
      "Manager Review",
      "Corrective Follow-Up"
    ],
    "source": "/gravity-document-studio",
    "sourceSha256": "ccc5a8a1c594fea68a793a409bf274e4e1a986a866cdc0f24111b9a86e59b275"
  },
  "managerhandoff": {
    "name": "Manager Handoff Form",
    "fields": [
      "Sales/Labor Status",
      "Staffing",
      "Guest Issues",
      "Product Shortages",
      "Equipment",
      "Cash",
      "Safety",
      "Unfinished Work",
      "Next-Shift Priorities"
    ],
    "source": "/gravity-document-studio",
    "sourceSha256": "ccc5a8a1c594fea68a793a409bf274e4e1a986a866cdc0f24111b9a86e59b275"
  }
};

export const fieldLabels={
 'Date/Time':'When did it happen?',Item:'Which meal or item?',Quantity:'How many?',Cost:'Amount taken off the bill, if known',Reason:'What happened? Why was the meal comped?',Disposition:'What was done with the meal?',
 'Manager Review':'What did the manager check?','Corrective Follow-Up':'What needs doing next?',
 'Guest Concern':'What did the guest report?',Facts:'What do you know so far?','Immediate Recovery':'What did you do for the guest?','Comp/Refund':'What was comped or refunded?','Manager Follow-Up':'What should the manager do next?','Root Cause':'What caused it? Leave blank until established.',Prevention:'How will you keep it from happening again?',
 'Sales/Labor Status':'How busy was it, and how was staffing?',Staffing:'Who was available to work?','Guest Issues':'What guest problems need attention?','Product Shortages':'What products were missing?',Equipment:'What equipment needs attention?',Cash:'What cash issues need attention?',Safety:'What safety issues need attention?','Unfinished Work':'What is unfinished?','Next-Shift Priorities':'What must the next shift do first?'
};
