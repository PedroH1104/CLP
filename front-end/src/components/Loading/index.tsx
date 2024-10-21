import { Oval } from 'react-loader-spinner';

export default function Loading() {
  return (
    <div className='flex justify-center'>
                    <Oval
                        height={75}
                        width={75}                        
                        color="#1D5FA3"
                        wrapperStyle={{}}
                        wrapperClass=""
                        visible={true}
                        ariaLabel='oval-loading'
                        secondaryColor="#EE6B35"
                        strokeWidth={2}
                        strokeWidthSecondary={2}
                    />
                </div>
  )
}
