import { IconActivity, IconBox, IconReceiptTax, IconStack3, IconStethoscope, IconTag, IconTruckDelivery, IconVirus } from "@tabler/icons-react";
import {
  IconAperture,
  IconBuildingHospital,
  IconCopy,
  IconLayoutDashboard,
  IconLogin,
  IconMedicalCross,
  IconMedicineSyrup,
  IconMoneybag,
  IconMoodHappy,
  IconPencilDown,
  IconStack,
  IconTypography,
  IconUserPlus,
  IconUsers,
} from "@tabler/icons-react";

import { uniqueId } from "lodash";

const Menuitems = [
  {
    navlabel: true,
    subheader: "Home",
  },

  {
    id: uniqueId(),
    title: "Dashboard",
    icon: IconLayoutDashboard,
    href: "/dashboard/",
  },
  {
    navlabel: true,
    subheader: "Utilities",
  },

  {
    id: uniqueId(),
    title: "Users",
    icon: IconUsers,
    href: "/dashboard/users/users",
  },

  {
    id: uniqueId(),
    title: "Enrollees",
    icon: IconMedicalCross,
    href: "/dashboard/enrollees/enrollees",
  },



  // {
  //   id: uniqueId(),
  //   title: "Products",
  //   icon: IconVirus,
  //   href: "/dashboard/products/products",
  // },

  // {
  //   id: uniqueId(),
  //   title: "Hospitals",
  //   icon: IconBuildingHospital,
  //   href: "/dashboard/hospitals/hospitals",
  // },





  {
    id: uniqueId(),
    title: "Products",
    icon: IconBox,
    href: "/dashboard/products/products",
  },
  


  {
    id: uniqueId(),
    title: "Product Requests",
    icon: IconPencilDown,
    href: "/dashboard/requests/requests",
  },

  {
    id: uniqueId(),
    title: "Stock",
    icon: IconStack3,
    href: "/dashboard/stock/stock",
  },

  {
    id: uniqueId(),
    title: "Transactions",
    icon: IconMoneybag,
    href: "/dashboard/transactions/transactions",
  },



  {
    id: uniqueId(),
    title: "Reports",
    icon: IconReceiptTax,
    href: "/dashboard/remittances/remittances",
  },

 

  // {
  //   navlabel: true,
  //   subheader: "Auth",
  // },
  // {
  //   id: uniqueId(),
  //   title: "Login",
  //   icon: IconLogin,
  //   href: "/dashboard/authentication/login",
  // },
  // {
  //   id: uniqueId(),
  //   title: "Register",
  //   icon: IconUserPlus,
  //   href: "/dashboard/authentication/register",
  // },
  // {
  //   navlabel: true,
  //   subheader: "Extra",
  // },
  // {
  //   id: uniqueId(),
  //   title: "Icons",
  //   icon: IconMoodHappy,
  //   href: "/dashboard/icons",
  // },
  // {
  //   id: uniqueId(),
  //   title: "Sample Page",
  //   icon: IconAperture,
  //   href: "/dashboard/sample-page",
  // },
];

export default Menuitems;
