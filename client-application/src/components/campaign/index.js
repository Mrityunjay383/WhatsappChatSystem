import React, {useState, useEffect} from "react";
import "../flow/index.scss";

import Sidebar from "../uiComponent/sidebar/index";
import TopCon from "../uiComponent/TopCon";

import DragCards from "../uiComponent/dnd/DragCards";
import DndFlowMap from "../uiComponent/dnd/DndFlowMap";
import {
  useNodesState,
  useEdgesState,
} from "react-flow-renderer";
import CampaignFlowCard from "../uiComponent/dnd/CampaignFlowCard";
import { callcreate_new_campaign, callgetflows, calloptedinUsers, callstoredCustomers } from "../../Services/Api";

const Campaign = ({
  setIsLogedin,
  userName,
  userId,
  noOfRequestedChats
}) => {
  //defining state variables
  const [flows, setFlows] = useState([]);

  const [optedinUsers, setOptedinUsers] = useState([]);
  const [searchedOptedinUsers, setSearchedOptedinUsers] = useState([]);

  const [newNumbers, setNewNumbers] = useState("");

  const [selectedNos, setSelectedNos] = useState([]);

  const [selNosByCheck, setSelNosByCheck] = useState([]);
  const [selNosByText, setSelNosByText] = useState([]);

  const [inputTime, setinputTime] = useState(0);
  const [time_delay, setTime_delay] = useState(0);
  const [format, setformat] = useState("min");
  const initialNodes = [];
  const [nodes, setNodes] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [campaignTitle, setCampaignTitle] = useState("");

  //getting all the approved templates
  const getFlows = async () => {
    const flows= await callgetflows(userId);
      //setting the flows with the response from the API
      setFlows(flows);
  };

  const getOptedinUsers = async () => {
    let optedinUsers,
      storedUsers,
      toBePopulateUsers = [];
      optedinUsers =await calloptedinUsers(userId);

     storedUsers= await callstoredCustomers();


    //gettig name of the customers from the stored users
    for (let optUser of optedinUsers) {
      const optUserFullPhoneNo = optUser.countryCode + optUser.phoneCode;

      let found = false;
      for (let user of storedUsers) {
        // console.log(user.userName, optUserFullPhoneNo);
        if (optUserFullPhoneNo === user.userPhoneNo) {
          toBePopulateUsers.push({phoneNo: optUserFullPhoneNo, userName: user.userName});
          found = true;
          break;
        }
      }
      if (!found) {
        toBePopulateUsers.push({phoneNo: optUserFullPhoneNo, userName: "{Name}"});
      }
    }

    setOptedinUsers(toBePopulateUsers);
    setSearchedOptedinUsers(toBePopulateUsers);
  };

  //searching functionality
  const sortOptedinNumbers = (e, inpType) => {
    const inp = e.target.value;

    setSearchedOptedinUsers(() => {
      return optedinUsers.filter((user) => {
        if (inpType === "Number") {
          return user.phoneNo.includes(inp);
        } else {
          return user.userName.toLowerCase().includes(inp.toLowerCase());
        }
      });
    });
  };

  //function for selecting a number by checking
  const listSelectedNos = async () => {
    const checkboxes = document.querySelectorAll("input[type=checkbox]:checked");
    let selectedPhoneNo = await Array.from(checkboxes).map((i) => i.value);

    setSelNosByCheck(selectedPhoneNo);
  };

  //function for removing the selected numbers
  const rmSelectedNo = (number) => {
    if (newNumbers.includes(number)) {
      let filteredNumbers = newNumbers.replace(number + ",", "");
      filteredNumbers = filteredNumbers.replace(number, "");
      setNewNumbers(filteredNumbers);

      setSelNosByText((curr) => {
        curr = curr.filter((num, index) => {
          return num !== number;
        });
        return curr;
      });
    }

    const checkboxes = Array.from(document.querySelectorAll("input[type=checkbox]:checked"));

    //Unchecking the checkboxes in the optedin list
    for (let checkbox of checkboxes) {
      if (checkbox.value === number) {
        checkbox.checked = false;
        break;
      }
    }

    //Removing number for SelNosByCheck
    setSelectedNos((curr) => {
      curr = curr.filter((num) => {
        return num !== number;
      });
      return curr;
    });
  };

  const getAcutalTime = () => {
    if (format === "min") {
      setTime_delay(inputTime * 60 * 1000);
    } else if (format === "sec") {
      setTime_delay(inputTime * 1000);
    }
  };
  useEffect(() => {
    getAcutalTime();
  }, [format, inputTime]);

  const handleSubmit = async (e) => {

    setEvents((curr) => {
      if (format === "min") {
        return [
          ...curr,
          ` ${time_delay / 1000}s`
        ];
      } else {
        return [
          ...curr,
          ` ${time_delay / 1000}s`
        ];
      }
    });
  };

  useEffect(() => {
    getFlows();
    getOptedinUsers();
  }, []);

  useEffect(() => {
    setSelectedNos([
      ...selNosByCheck,
      ...selNosByText
    ]);
  }, [selNosByCheck, selNosByText]);

  const [selectedFlows, setSelectedFlows] = useState([]);
  // to select a component
  const selectFlows = (title,id) => {
    let f=1;
    selectedFlows.forEach((flow)=>{
      if(flow.title === title){
        f=0;
      }
    });

      setSelectedFlows((selectedflow)=>{
       if(f){
        return [...selectedflow,{title,id}];
       }
        else{
          return [...selectedflow];
        }
      });

  };
  const deleteTemplate = (e) => {
    setSelectedFlows((curr) => {
      const ind = curr.indexOf(e.target.value);
      curr.splice(ind, 1);

      return [...curr];
    });
  };

  const [events, setEvents] = useState([
    "Enqueued",
    "Failed",
    "Read",
    "Sent",
    "Delivered",
    "Delete"
  ]);
  const [keyword, setKeyword] = useState("");
  const [keywordList, setKeywordList] = useState([]);

  const handleKeyword = (e) => {
    setEvents((curr) => {
      return [
        ...curr,
        keyword
      ];
    });
    setKeywordList((curr) => {
      return [
        ...curr,
        keyword
      ];
    })

  };

  // dnd components
  let startNode = {};
  const FlowDataSubmit = () => {
    // lets find the start and end
    let FlowData = {};
    let endNodes = [];
    // for every node check every edge if it is the starting node by checking target of edge

    for (let i = 0; i < nodes.length; i++) {
      let flag = 1;
      for (let j = 0; j < edges.length; j++) {
        if (nodes[i].id === edges[j].target) {
          flag = 0;
          break;
        }
      }
      if (flag) {
        startNode = nodes[i];
        break;
      }
    }

    // for final destination targets array as multiple targets can be there
    for (let i = 0; i < nodes.length; i++) {
      let flag = 1;
      for (let j = 0; j < edges.length; j++) {
        if (nodes[i].id === edges[j].source) {
          flag = 0;
          break;
        }
      }
      if (flag) {
        endNodes.push(nodes[i]);
      }
    }

    let tMessageListobj = {};
    let helperObject = {};

    for (let i = 0; i < nodes.length; i++) {
      // console.log(nodes[i].id);
      helperObject[nodes[i].id] = nodes[i].type;
    }
    // console.log(helperObject);
    for (let i = 0; i < nodes.length; i++) {
      let tMessage,
        events = [];
      let flag = 0;
      flows.forEach((template) => {
        if (template.title === nodes[i].type) {
          flag = 1;
        }
      });

      let flagend = 0;
      endNodes.forEach((endNode) => {
        if (endNode.type === nodes[i].type) {
          flagend = 1;
        }
      });

      // if node is an template and not in last array
      if (flag && !flagend) {
        // check all edges where source is this node
        for (let j = 0; j < edges.length; j++) {
          if (edges[j].source === nodes[i].id) {
            let event,
              action;
            let flage = 0;
            flows.forEach((template) => {
              if (template.title === helperObject[edges[j].target]) {
                flage = 1;
              }
            });
            if (!flage) {
              let e = helperObject[edges[j].target];
              let str = e.split("");
              let time = "";
              for (let ind = 0; ind < str.length - 1; ind++) {
                time = time + str[ind];
              }

              if (Number(str[0]) >= 0 && Number(str[0]) <= 9) {
                event = Number(time);
              } else {
                let flagk = 0;
                keywordList.forEach((keyword) => {
                  if (keyword === helperObject[edges[j].target]) {
                    flagk = 1;
                  }
                });

                if (flagk) {
                  event = `${helperObject[edges[j].target].toLowerCase()}`;
                } else {
                  event = `!${helperObject[edges[j].target].toLowerCase()}`;
                }
              }
            } else {
              event = undefined;
            }
            for (let k = 0; k < edges.length; k++) {
              if (edges[k].source === edges[j].target) {
                let flagt = 0;
                flows.forEach((template) => {
                  if (template.title === helperObject[edges[k].target]) {
                    flagt = 1;
                  }
                });
                if (flagt) {
                  action = edges[k].target;
                } else {
                  action = undefined;
                }

                break;
              }
            }
            events.push({event, action});
          }
        }
        tMessageListobj = {
          events: events
        };
        const tid= nodes[i].id;
        FlowData[`${tid}`] = // IF node is template and also in last array that is ending node
        tMessageListobj;
      } else if (flag && flagend) {
        let event,
          action;
        event = "!end";
        action = "!end";
        events.push({event, action});
        tMessageListobj = {
          events: events
        };
        const tid = nodes[i].id;
        FlowData[`${tid}`] = tMessageListobj;
      }
      // if not template then dont do anything
    }
    return FlowData;

    // if not template then dont do anything
  };
  //---end of function
  // Final Submit Function for data of Flow
  const FinalSubmit = async () => {
    const data = {
      title: campaignTitle,
      tFlowList: FlowDataSubmit(),
      contactList: selectedNos ,
      cid: userId,
      startFlow: startNode.id
    };
    console.log(data);
    try {
      var response = await callcreate_new_campaign(data);
    console.log(response.data);
    }
    catch(e){
      console.log(e);
    }
  };


  return (<div className="rootCon" id="rootCon">
    <Sidebar role="Manager" setIsLogedin={setIsLogedin} page="campaign" noOfRequestedChats={noOfRequestedChats}/>

    <div className="dataCon" id="dataCon">
      <TopCon userName={userName} page="Campaign"/>

      <div>
        <div>
          <h3>FLows:</h3>
          {/* card component */}
          <div className="cards-container" id="cards-container">
            {
              flows.map((flow, index) => {
                return <CampaignFlowCard key={`flows${index}`} flow={flow} select={selectFlows}/>;
              })
            }
          </div>
        </div>
        <div>
          <div>
            <h3 id="heading_container">Build Campaign:</h3>
            <div className="flow_title_container" id="flow_title_container">
              <input type="text" placeholder="Give Campaign a title" value={campaignTitle} onChange={(e) => setCampaignTitle(e.target.value)}/>
            </div>
            <div className="flow_timeKey_container" id="flow_timeKey_container">
              <span>Add Time Delay:</span>

              <div className="mid_input_container" id="mid_input_container">

                <input type="number" value={inputTime} onChange={(ele) => {
                    setinputTime(ele.target.value);
                  }}
                />

                <select value={format} onChange={(e) => {
                    setformat(e.target.value);
                  }} name="format" id="format">
                  <option value="min">minutes</option>
                  <option value="sec">
                    seconds</option>
                </select>

              </div>

              <button type="button" className="joinbtn" id="joinbtn6" onClick={handleSubmit}>Add</button>
            </div>
            <div className="flow_timeKey_container">
              <span>
                Add Enter Keyword:
              </span>
              <input type="text" className="mid_input" id="mid_input" value={keyword} onChange={(e) => setKeyword(e.target.value)}/>
              <button type="button" className="joinbtn" id="joinbtn" onClick={handleKeyword}>Add</button>
            </div>

            {/* Events section */}
            <div className="flow_timeKey_container events_container" id="flow_timeKey_container1">
              {
                events.map((temp, index) => {
                  return (<DragCards template={temp} key={`events${index}`} deleteTemplate={deleteTemplate} showDel={false}
                    // moveCard={moveCard}
                  />);
                })
              }
            </div>
          </div>

          {/* container for selected flows */}
          <div className="selected-flow-area" id="selected-flow-area">
            <div className="Selected-container " id="Selected-container " >
              {
                selectedFlows.map((temp,index) => {
                  return (<DragCards  key={`selFlow${index}`}template={temp.title} deleteTemplate={deleteTemplate} showDel={true}
                    // moveCard={moveCard}
                  />);
                })
              }
            </div>
            {/* this is the board where selected flows are droped */}
            <div className="Dnd-flow-canva" id="Dnd-flow-canva">
              <DndFlowMap key={"flowMap"}  flow={true} nodes={nodes} setNodes={setNodes} edges={edges} setEdges={setEdges} onEdgesChange={onEdgesChange} templates={flows} setTemplates={setFlows} selectedTemplates={selectedFlows} setSelectedTemplates={setSelectedFlows} events={events} setEvents={setEvents}/>
            </div>

          </div>
        </div>

        <div className="InpNoCon" id="InpNoCon">
          <div className="optinNoCon" id="optinNoCon">
            <h3>Otp In Numbers:
            </h3>
            <div className="searchCon" id="searchCon">
              <input type="number" placeholder="Search by Number" onChange={(e) => {
                  sortOptedinNumbers(e, "Number");
                }}/>
              <input type="text" placeholder="Search by Name" onChange={(e) => {
                  sortOptedinNumbers(e, "Name");
                }}/>
            </div>
            <div className="numbersList" id="numbersList">
              {
                searchedOptedinUsers.map((user, index) => {
                  return (<div key={`optUser${index}`}>
                    <label onClick={listSelectedNos} className="checkboxCon">
                      <input type="checkbox" name={user.phoneNo} value={user.phoneNo}/>
                      <span className="checkmark"></span>
                    </label>
                    <label htmlFor={user.phoneNo}>{user.phoneNo}</label>
                    <span>{user.userName}</span>
                  </div>);
                })
              }
            </div>
          </div>

          <div className="newNoCon" id="newNoCon">
            <h3>Input New Numbers:
            </h3>
            <span>Enter comma(,) seperated numbers</span>
            <br/>
            <textarea onChange={(e) => {
                setNewNumbers(e.target.value);
                let newNumbersArr = e.target.value.split(",");
                newNumbersArr = newNumbersArr.map((i) => i.replace(" ", ""));
                newNumbersArr = newNumbersArr.filter((number) => {
                  return number.length === 12;
                });

                setSelNosByText(newNumbersArr);
              }} value={newNumbers}></textarea>
            <br/>
          </div>

          <div className="selectedNoCon" id="selectedNoCon">
            <h3>Selected Numbers:
            </h3>
            <div className="selectedNumbersList" id="selectedNumbersList">
              {
                selectedNos.length > 0
                  ? (selectedNos.map((number, index) => {
                    return (<div key={`selNos${index}`}>
                      <span>{number}</span>
                      <button className="rmSelectedNoBtn" onClick={() => {
                          rmSelectedNo(number);
                        }}>
                        &#9587;
                      </button>
                    </div>);
                  }))
                  : (<span>No Number Selected...</span>)
              }
            </div>
          </div>
        </div>
        <div className="brdBtnCon" id="brdBtnCon">
          <button className="joinbtn brdCsBtn" id="joinbtn2" onClick={FinalSubmit}>
            Submit
          </button>
        </div>
      </div>
    </div>
  </div>);
}

export default Campaign;
