import React from 'react'

const ButtonMain = ({clicked ,bg, text}) =>{
    return (
    <div className="flex justify-end gap-4.5">
                      <div
                        className={`flex justify-center cursor-pointer rounded border
                         border-stroke py-2 px-6 font-medium  text-white  ${bg}`}
                        onClick={clicked}
                      >
                       {text}
                      </div>
                    </div>
  )
  }

export default ButtonMain


